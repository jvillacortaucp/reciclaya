import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  isDevMode,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideLoaderCircle, LucideMinus, LucidePlus, LucideWandSparkles } from '@lucide/angular';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { ValueSectorFacade } from './application/value-sector.facade';
import { VALUE_SECTOR_TEXT } from './data/value-sector.constants';
import { ValueSectorProduct, ValueSectorRoute } from './models/value-sector.model';
import { ValueSectorActionButtonsComponent } from './presentation/components/value-sector-action-buttons/value-sector-action-buttons.component';
import { ValueSectorRoutesMapComponent } from './presentation/components/value-sector-routes-map/value-sector-routes-map.component';
import { VALUE_SECTOR_MAP_LAYOUT } from './presentation/constants/value-sector-map-layout.constants';

@Component({
  selector: 'app-value-sector-page',
  standalone: true,
  imports: [
    LucideLoaderCircle,
    LucideMinus,
    LucidePlus,
    LucideWandSparkles,
    ValueSectorRoutesMapComponent,
    ValueSectorActionButtonsComponent,
    RouterLink
  ],
  templateUrl: './value-sector.page.html',
  styleUrl: './value-sector.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly ROUTE_SLOT_ORDER = ['TL', 'TR', 'BL', 'BR'] as const;
  private readonly SLOT_INDEX_BY_NAME: Record<(typeof this.ROUTE_SLOT_ORDER)[number], number> = {
    TL: 0,
    TR: 1,
    BL: 2,
    BR: 3
  };
  private readonly facade = inject(ValueSectorFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

  private panzoom: PanzoomObject | null = null;
  private isPointerPanning = false;
  private lastPointer = { x: 0, y: 0 };
  private hadData = false;
  private hasCenteredForCurrentData = false;
  private initialFocusFrame: number | null = null;

  protected readonly isInitialLoading = this.facade.isInitialLoading;
  protected readonly listingId = this.facade.listingId;
  protected readonly items = this.facade.items;
  protected readonly isGenerating = this.facade.isGenerating;
  protected readonly loadError = this.facade.loadError;
  protected readonly fromListingMode = this.facade.fromListingMode;
  protected readonly listingResidueLabel = this.facade.listingResidueLabel;
  protected readonly text = VALUE_SECTOR_TEXT;

  protected readonly hasUsableData = computed(() => this.items().some((route) => route.products.length > 0));
  protected readonly subtitle = computed(
    () => `${this.items().slice(0, 4).length} industrias detectadas con alto potencial de valorización.`
  );
  protected readonly hasRouteFocus = computed(() => !!this.activeRouteId());

  protected readonly activeRoute = computed<ValueSectorRoute | null>(() => {
    const routeId = this.activeRouteId();
    return routeId ? this.items().find((item) => item.id === routeId) ?? null : null;
  });

  protected readonly activeProduct = computed<ValueSectorProduct | null>(() => {
    const route = this.activeRoute();
    const productId = this.activeProductId();
    return route && productId ? route.products.find((item) => item.id === productId) ?? null : null;
  });
  protected readonly selectedRouteProducts = computed<readonly ValueSectorProduct[]>(() =>
    this.activeRoute()?.products.slice(0, 4) ?? []
  );
  protected readonly hasSelectedRouteProducts = computed(() => this.selectedRouteProducts().length > 0);
  protected readonly selectedProductId = computed(() => this.activeProductId());
  protected readonly hasSelectedProduct = computed(() => !!this.activeProductId());
  protected readonly productPanelAnimated = computed(() => this.panelAnimate());
  protected readonly actionButtonsAnimated = computed(() => this.buttonsAnimate());

  protected readonly minZoomPercent = 55;
  protected readonly maxZoomPercent = 190;
  protected readonly zoomPercent = computed(() => Math.round(this.currentScale() * 100));
  protected readonly zoomPercentLabel = computed(() => `${this.zoomPercent()}%`);
  protected readonly isSmallMobile = computed(() => this.viewportWidth() <= 393);

  // Canonical scene geometry (single source of truth)
  private readonly desktopSceneWidth = 2200;
  private readonly desktopSceneHeight = 1300;
  private readonly desktopMapAnchorX = 650;
  private readonly desktopMapAnchorY = 380;
  private readonly desktopMapAnchorWidth = 900;

  // Modo guiado móvil: prioriza que el grafo sea visible sin pan inicial.
  private readonly mobileSceneWidth = 360;
  private readonly mobileSceneHeight = 760;
  private readonly mobileMapAnchorX = 20;
  private readonly mobileMapAnchorY = 115;
  private readonly mobileMapAnchorWidth = 320;

  protected readonly sceneWidth = computed(() =>
    this.isSmallMobile() ? this.mobileSceneWidth : this.desktopSceneWidth
  );
  protected readonly sceneHeight = computed(() =>
    this.isSmallMobile() ? this.mobileSceneHeight : this.desktopSceneHeight
  );
  protected readonly mapAnchorX = computed(() =>
    this.isSmallMobile() ? this.mobileMapAnchorX : this.desktopMapAnchorX
  );
  protected readonly mapAnchorY = computed(() =>
    this.isSmallMobile() ? this.mobileMapAnchorY : this.desktopMapAnchorY
  );
  protected readonly mapAnchorWidth = computed(() =>
    this.isSmallMobile() ? this.mobileMapAnchorWidth : this.desktopMapAnchorWidth
  );

  protected readonly mapAnchorStyles = computed(() => ({
    left: `${this.mapAnchorX()}px`,
    top: `${this.mapAnchorY()}px`,
    width: `${this.mapAnchorWidth()}px`
  }));
  protected readonly workspaceViewportHeight = computed(() =>
    this.isSmallMobile() ? 'calc(100vh - 138px)' : null
  );
  protected readonly workspaceViewportMinHeight = computed(() => (this.isSmallMobile() ? 360 : 420));
  protected readonly productGroupStyles = computed(() => {
    const position = this.productGroupPosition();
    return {
      left: `${position.x}px`,
      top: `${position.y}px`
    };
  });
  protected readonly productConnectorPath = computed(() => {
    const path = this.productConnectorPathSignal();
    if (!path) {
      return null;
    }
    return `M ${path.fromX} ${path.fromY} C ${path.c1x} ${path.c1y}, ${path.c2x} ${path.c2y}, ${path.toX} ${path.toY}`;
  });

  @ViewChild('workspaceViewport') private workspaceViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('workspaceContent') private workspaceContent?: ElementRef<HTMLDivElement>;
  @ViewChild('mapAnchor') private mapAnchor?: ElementRef<HTMLDivElement>;

  private readonly activeRouteId = signal<string | null>(null);
  private readonly activeProductId = signal<string | null>(null);
  private readonly focusState = signal<'INITIAL_CENTERED' | 'ROUTE_FOCUSED' | 'PRODUCT_FOCUSED'>('INITIAL_CENTERED');
  private readonly panelAnimate = signal(false);
  private readonly buttonsAnimate = signal(false);
  private readonly productGroupPosition = signal<{ x: number; y: number }>({ x: 1360, y: 360 });
  private readonly productConnectorPathSignal = signal<{
    fromX: number;
    fromY: number;
    c1x: number;
    c1y: number;
    c2x: number;
    c2y: number;
    toX: number;
    toY: number;
  } | null>(null);
  private readonly currentScale = signal(0.77);
  private readonly initialScale = 0.77;

  private readonly sceneOverscanX = 1000;
  private readonly sceneOverscanY = 680;
  private readonly minScale = 0.55;
  private readonly maxScale = 1.9;
  private readonly zoomStep = 0.08;
  // Ancho base del panel de productos (ajústalo para cards más anchas/estrechas)
  private readonly productPanelWidth = 360;
  // Alto estimado del panel (afecta cálculo de colisión/posicionamiento)
  private readonly productPanelHeight = 460;
  // Separación horizontal entre ruta activa y panel de productos
  private readonly productPanelGapX = 24;
  // Separación vertical base para colocar el panel relativo a la ruta
  private readonly productPanelGapY = 24;
  // Tolerancia de foco en píxeles: evita micro-rebotes al centrar
  private readonly focusTolerancePx = 8;
  private readonly productPanelDefault = { x: 1360, y: 360 };
  // Ajuste fino del foco inicial respecto al centro del mapa (coordenadas globales de escena).
  // OFFSET_X: derecha + / izquierda -
  // OFFSET_Y: abajo + / arriba -
  // Calibración rápida sugerida: pasos de 25px.
  private readonly INITIAL_DATA_FOCUS_OFFSET_X = 450;
  private readonly INITIAL_DATA_FOCUS_OFFSET_Y = 250;
  private readonly INITIAL_DATA_FOCUS_SCALE = 0.77;

  // AJUSTE RAPIDO DEL PANEL DE PRODUCTOS RELATIVO A LA CARD DE RUTA SELECCIONADA
  // Cada entrada corresponde al slot visual: [TL, TR, BL, BR]
  // x: desplaza el panel desde el borde izquierdo de la card seleccionada (px)
  // y: desplaza el panel desde el borde superior de la card seleccionada (px)
  private readonly PANEL_OFFSET_BY_SLOT = [
    { x: -430, y: -170 }, // TL: panel afuera a la izquierda de ruta sup-izq
    { x: 260, y: -170 }, // TR: panel afuera a la derecha de ruta sup-der
    { x: -430, y: 160 }, // BL: panel afuera arriba-izquierda de ruta inf-izq
    { x: 260, y: 160 } // BR: panel afuera arriba-derecha de ruta inf-der
  ] as const;
  // Anclaje horizontal del conector cuando entra al panel/card desde izquierda/derecha.
  private readonly PRODUCT_CONNECTOR_TO_X_LEFT = 0;
  private readonly PRODUCT_CONNECTOR_TO_X_RIGHT = this.productPanelWidth;
  // Anclaje vertical preferido por cuadrante superior/inferior.
  private readonly PRODUCT_CONNECTOR_TO_Y_TOP = 88;
  private readonly PRODUCT_CONNECTOR_TO_Y_BOTTOM = this.productPanelHeight - 88;
  // Margen para "pegar" conector al borde de la card sin invadir contenido.
  private readonly PRODUCT_CONNECTOR_TO_CARD_INSET = 2;
  // Autofocus por slot (rutas): coordenadas globales de escena (workspaceContent).
  // X: derecha + / izquierda -, Y: abajo + / arriba -.
  // TL/TR/BL/BR son posiciones visuales, no ids de datos.
  private readonly AUTOFOCUS_ROUTE_X_BY_SLOT = { TL: 850, TR: 1350, BL: 850, BR: 1350 } as const;
  private readonly AUTOFOCUS_ROUTE_Y_BY_SLOT = { TL: 470, TR: 470, BL: 780, BR: 780 } as const;
  private readonly AUTOFOCUS_ROUTE_SCALE_BY_SLOT = { TL: 0.77, TR: 0.77, BL: 0.77, BR: 0.77 } as const;

  // Autofocus por slot (panel de productos): coordenadas globales de escena (workspaceContent).
  // Ajusta en pasos de 25 para calibrar fino por slot.
  private readonly AUTOFOCUS_PRODUCT_PANEL_X_BY_SLOT = { TL: 200, TR: 800, BL: -100, BR: 800 } as const;
  private readonly AUTOFOCUS_PRODUCT_PANEL_Y_BY_SLOT = { TL: 100, TR: 100, BL: -100, BR: 450 } as const;
  private readonly AUTOFOCUS_PRODUCT_PANEL_SCALE_BY_SLOT = { TL: 1, TR: 1, BL: 1, BR: 1 } as const;

  // Fallback global del autofocus por selección.
  private readonly AUTOFOCUS_DEFAULT_SCALE = 0.77;
  private readonly AUTOFOCUS_DEFAULT_OFFSET_X = 0;
  private readonly AUTOFOCUS_DEFAULT_OFFSET_Y = 0;
  private readonly onWindowResize = () => {
    this.viewportWidth.set(window.innerWidth);
    this.updateProductGroupPosition();
  };
  private pendingInitialFocusId: string | null = null;

  constructor() {
    effect(() => {
      if (!this.items().length) {
        this.hadData = false;
        this.hasCenteredForCurrentData = false;
        this.teardownPanzoom();
        return;
      }
      queueMicrotask(() => this.tryInitPanzoom());
    });

    effect(() => {
      const hasData = this.items().length > 0;
      if (!hasData || !this.panzoom) return;
      if (!this.hadData || !this.hasCenteredForCurrentData) {
        this.hadData = true;
        this.hasCenteredForCurrentData = true;
        queueMicrotask(() => {
          this.pendingInitialFocusId = 'INITIAL_CENTER';
          this.centerInitialViewport();
          this.initialFocusFrame = requestAnimationFrame(() => {
            if (!this.pendingInitialFocusId) return;
            if (!this.isInitialCenterInTolerance()) {
              this.centerInitialViewport();
            }
            this.pendingInitialFocusId = null;
            this.initialFocusFrame = null;
          });
        });
      }
    });

    effect(() => {
      this.activeRouteId();
      queueMicrotask(() => this.updateProductGroupPosition());
    });

    effect(() => {
      const routeId = this.activeRouteId();
      if (!routeId) {
        this.panelAnimate.set(false);
        return;
      }
      this.triggerPanelAnimation();
    });
  }

  ngOnInit(): void {
    this.viewportWidth.set(window.innerWidth);
    this.route.queryParamMap.subscribe((params) => {
      const listingId = params.get('listing');
      const shouldRestoreScroll = this.facade.hasLoadedListing(listingId);

      this.facade.initialize(listingId);
      this.activeRouteId.set(null);
      this.activeProductId.set(null);

      if (shouldRestoreScroll) {
        queueMicrotask(() =>
          window.scrollTo({
            top: this.facade.getRememberedScrollPosition(),
            behavior: 'auto'
          })
        );
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewportWidth.set(window.innerWidth);
    this.tryInitPanzoom();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    this.teardownPanzoom();
    window.removeEventListener('resize', this.onWindowResize);
    this.cancelInitialFocusFrame();
  }

  protected onRouteSelected(routeId: string): void {
    const route = this.items().find((item) => item.id === routeId);
    if (!route) return;

    this.activeRouteId.set(routeId);
    this.activeProductId.set(null);
    this.buttonsAnimate.set(false);
    this.focusState.set('ROUTE_FOCUSED');
    queueMicrotask(() => {
      this.updateProductGroupPosition();
      requestAnimationFrame(() => {
        if (this.isSmallMobile()) return;
        this.focusFirstProductCardForRoute(routeId);
      });
    });
  }

  protected onProductSelected(productId: string): void {
    const route = this.activeRoute();
    if (!route) return;
    this.activeProductId.set(productId);
    this.facade.selectProduct(route.id, productId);
    this.focusState.set('PRODUCT_FOCUSED');
    this.triggerButtonsAnimation();
  }

  protected onGenerateRequested(): void {
    this.facade.generateForSelectedListing();
  }
  protected onProcessRequested(): void {
    this.navigateToRecommendations('process');
  }
  protected onExplanationRequested(): void {
    this.navigateToRecommendations('complexity');
  }
  protected onMarketRequested(): void {
    this.navigateToRecommendations('market');
  }

  protected retryLoad(): void {
    this.facade.initialize(this.listingId());
    this.activeRouteId.set(null);
    this.activeProductId.set(null);
    this.focusState.set('INITIAL_CENTERED');
    this.hadData = false;
    this.hasCenteredForCurrentData = false;
    queueMicrotask(() => this.centerInitialViewport());
  }

  protected onBackRequested(): void {
    this.activeRouteId.set(null);
    this.activeProductId.set(null);
    this.panelAnimate.set(false);
    this.buttonsAnimate.set(false);
    this.focusState.set('INITIAL_CENTERED');
    this.centerInitialViewport();
    this.productGroupPosition.set(this.productPanelDefault);
    this.productConnectorPathSignal.set(null);
  }

  protected zoomIn(): void {
    this.setZoomValue(this.currentScale() + this.zoomStep);
  }

  protected zoomOut(): void {
    this.setZoomValue(this.currentScale() - this.zoomStep);
  }

  protected onZoomSliderInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = Number(target?.value);
    if (!Number.isFinite(value)) return;
    if (!this.panzoom && isDevMode()) console.log('[ValueSector] zoom input ignored: panzoom not initialized yet');
    this.setZoomPercent(value);
  }

  private navigateToRecommendations(tab: 'process' | 'complexity' | 'market'): void {
    const route = this.activeRoute();
    const productId = this.activeProductId();
    if (!route || !productId) return;
    this.facade.rememberScrollPosition(window.scrollY);
    this.facade.selectProduct(route.id, productId);
    void this.router.navigate(['/app/recommendations', productId], {
      queryParams: {
        tab,
        listing: this.listingId() ?? undefined
      }
    });
  }

  private tryInitPanzoom(): void {
    if (this.panzoom) return;

    const content = this.workspaceContent?.nativeElement;
    const viewport = this.workspaceViewport?.nativeElement;
    if (!content || !viewport) return;

    this.panzoom = Panzoom(content, {
      minScale: this.minScale,
      maxScale: this.maxScale,
      step: 0.06,
      startScale: this.initialScale,
      canvas: true
    });

    this.currentScale.set(this.clampScale(this.panzoom.getScale()));
    content.addEventListener('panzoomchange', this.onPanZoomChange);
    viewport.addEventListener('wheel', this.panzoom.zoomWithWheel, { passive: false });
    viewport.addEventListener('pointerdown', this.onPointerDown);
    viewport.addEventListener('pointermove', this.onPointerMove);
    viewport.addEventListener('pointerup', this.onPointerUp);
    viewport.addEventListener('pointercancel', this.onPointerUp);

    if (isDevMode()) console.log('[ValueSector] Panzoom initialized');
  }

  private teardownPanzoom(): void {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;

    if (viewport && this.panzoom) {
      viewport.removeEventListener('wheel', this.panzoom.zoomWithWheel);
      viewport.removeEventListener('pointerdown', this.onPointerDown);
      viewport.removeEventListener('pointermove', this.onPointerMove);
      viewport.removeEventListener('pointerup', this.onPointerUp);
      viewport.removeEventListener('pointercancel', this.onPointerUp);
    }
    content?.removeEventListener('panzoomchange', this.onPanZoomChange);

    if (this.panzoom) {
      this.panzoom.destroy();
      this.panzoom = null;
      if (isDevMode()) console.log('[ValueSector] Panzoom destroyed');
    }
    this.cancelInitialFocusFrame();
  }

  private centerInitialViewport(): void {
    // Fuente de verdad: centrar usando el nodo principal real renderizado.
    const content = this.workspaceContent?.nativeElement;
    const mapCenterNode = content?.querySelector<HTMLElement>('[data-focus-id="map-center"]');
    if (content && mapCenterNode) {
      const center = this.resolveCenterInContent(content, mapCenterNode);
      if (center) {
        this.focusPoint(
          center.x + this.INITIAL_DATA_FOCUS_OFFSET_X,
          center.y + this.INITIAL_DATA_FOCUS_OFFSET_Y,
          this.INITIAL_DATA_FOCUS_SCALE,
          false
        );
        return;
      }
    }

    // Fallback por constantes si el nodo aún no existe en DOM.
    const initialFocusX = this.mapAnchorX() + VALUE_SECTOR_MAP_LAYOUT.centerX + this.INITIAL_DATA_FOCUS_OFFSET_X;
    const initialFocusY = this.mapAnchorY() + VALUE_SECTOR_MAP_LAYOUT.centerY + this.INITIAL_DATA_FOCUS_OFFSET_Y;
    this.focusPoint(initialFocusX, initialFocusY, this.INITIAL_DATA_FOCUS_SCALE, false);
  }

  private resolveRouteSlot(routeId: string): (typeof this.ROUTE_SLOT_ORDER)[number] | null {
    const mapAnchor = this.mapAnchor?.nativeElement;
    if (!mapAnchor) return null;

    const routeCard = mapAnchor.querySelector<HTMLElement>(`[data-route-card-id="${routeId}"]`);
    if (!routeCard) return null;

    // Slot por posición visual real renderizada (no por índice de datos).
    const routeCenterX = routeCard.offsetLeft;
    const routeCenterY = routeCard.offsetTop;
    const mapCenterX = VALUE_SECTOR_MAP_LAYOUT.centerX;
    const mapCenterY = VALUE_SECTOR_MAP_LAYOUT.centerY;

    const isLeft = routeCenterX < mapCenterX;
    const isTop = routeCenterY < mapCenterY;

    if (isLeft && isTop) return 'TL';
    if (!isLeft && isTop) return 'TR';
    if (isLeft && !isTop) return 'BL';
    return 'BR';
  }

  private focusRouteBySlot(routeId: string): void {
    const slot = this.resolveRouteSlot(routeId);
    if (!slot) {
      this.focusById(`route:${routeId}`);
      return;
    }
    const x = this.AUTOFOCUS_ROUTE_X_BY_SLOT[slot] + this.AUTOFOCUS_DEFAULT_OFFSET_X;
    const y = this.AUTOFOCUS_ROUTE_Y_BY_SLOT[slot] + this.AUTOFOCUS_DEFAULT_OFFSET_Y;
    const scale = this.AUTOFOCUS_ROUTE_SCALE_BY_SLOT[slot] ?? this.AUTOFOCUS_DEFAULT_SCALE;
    if (isDevMode()) {
      console.log('[ValueSector] route autofocus by slot', { routeId, slot, x, y, scale });
    }
    this.focusPoint(x, y, scale);
  }

  private focusProductPanelBySlot(routeId: string): void {
    const slot = this.resolveRouteSlot(routeId);
    if (!slot) {
      this.focusById('product-panel');
      return;
    }
    const x = this.AUTOFOCUS_PRODUCT_PANEL_X_BY_SLOT[slot] + this.AUTOFOCUS_DEFAULT_OFFSET_X;
    const y = this.AUTOFOCUS_PRODUCT_PANEL_Y_BY_SLOT[slot] + this.AUTOFOCUS_DEFAULT_OFFSET_Y;
    const scale = this.AUTOFOCUS_PRODUCT_PANEL_SCALE_BY_SLOT[slot] ?? this.AUTOFOCUS_DEFAULT_SCALE;
    if (isDevMode()) {
      console.log('[ValueSector] product panel autofocus by slot', { routeId, slot, x, y, scale });
    }
    this.focusPoint(x, y, scale);
  }

  private focusFirstProductCardForRoute(routeId: string): void {
    const slot = this.resolveRouteSlot(routeId);
    const scale =
      (slot && this.AUTOFOCUS_PRODUCT_PANEL_SCALE_BY_SLOT[slot]) ??
      this.AUTOFOCUS_DEFAULT_SCALE;

    const content = this.workspaceContent?.nativeElement;
    const panel = content?.querySelector<HTMLElement>('[data-focus-id="product-panel"]');
    const firstCard = panel?.querySelector<HTMLElement>('[data-product-card]');

    if (content && firstCard) {
      const center = this.resolveCenterInContent(content, firstCard);
      if (center) {
        if (isDevMode()) {
          console.log('[ValueSector] product panel autofocus target', {
            routeId,
            slot,
            target: 'first-product-card',
            x: center.x,
            y: center.y,
            scale
          });
        }
        this.focusPoint(center.x, center.y, scale);
        return;
      }
    }

    if (content && panel) {
      const center = this.resolveCenterInContent(content, panel);
      if (center) {
        if (isDevMode()) {
          console.log('[ValueSector] product panel autofocus target', {
            routeId,
            slot,
            target: 'product-panel',
            x: center.x,
            y: center.y,
            scale
          });
        }
        this.focusPoint(center.x, center.y, scale);
        return;
      }
    }

    if (isDevMode()) {
      console.log('[ValueSector] product panel autofocus target', {
        routeId,
        slot,
        target: 'slot-fallback'
      });
    }
    this.focusProductPanelBySlot(routeId);
  }

  private focusById(focusId: string, scale?: number, skipRetry = false): void {
    const content = this.workspaceContent?.nativeElement;
    const element = content?.querySelector<HTMLElement>(`[data-focus-id="${focusId}"]`);
    if (!content || !this.panzoom) return;
    if (!element) {
      if (!skipRetry) {
        queueMicrotask(() =>
          requestAnimationFrame(() => {
            this.focusById(focusId, scale, true);
          })
        );
      }
      return;
    }

    const center = this.resolveCenterInContent(content, element);
    if (!center) return;

    const targetCenterX = center.x;
    const targetCenterY = center.y;
    this.focusPoint(targetCenterX, targetCenterY, scale ?? this.currentScale());
  }

  private resolveCenterInContent(
    content: HTMLElement,
    element: HTMLElement
  ): { x: number; y: number } | null {
    let x = element.offsetLeft;
    let y = element.offsetTop;
    let current: HTMLElement | null = element.offsetParent as HTMLElement | null;

    while (current && current !== content) {
      x += current.offsetLeft;
      y += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    if (current !== content) return null;

    const hasHalfTranslateX = element.classList.contains('-translate-x-1/2');
    const hasHalfTranslateY = element.classList.contains('-translate-y-1/2');
    return {
      x: hasHalfTranslateX ? x : x + element.offsetWidth / 2,
      y: hasHalfTranslateY ? y : y + element.offsetHeight / 2
    };
  }

  private focusPoint(targetCenterX: number, targetCenterY: number, scale: number, animate = true): void {
    const viewport = this.workspaceViewport?.nativeElement;
    if (!viewport || !this.panzoom) return;

    const panX = viewport.clientWidth / 2 - targetCenterX * scale;
    const panY = viewport.clientHeight / 2 - targetCenterY * scale;
    const boundedPan = this.clampPan(panX, panY, scale);
    const clampedCenterX = (viewport.clientWidth / 2 - boundedPan.x) / scale;
    const clampedCenterY = (viewport.clientHeight / 2 - boundedPan.y) / scale;
    const clampDx = clampedCenterX - targetCenterX;
    const clampDy = clampedCenterY - targetCenterY;
    if (isDevMode() && (Math.abs(clampDx) > 0.5 || Math.abs(clampDy) > 0.5)) {
      console.log('[ValueSector] autofocus clamped', {
        requested: { x: targetCenterX, y: targetCenterY, scale },
        applied: { x: clampedCenterX, y: clampedCenterY, scale },
        delta: { x: clampDx, y: clampDy }
      });
    }
    const currentPan = this.panzoom.getPan();
    const noPanChange =
      Math.abs(currentPan.x - boundedPan.x) <= this.focusTolerancePx &&
      Math.abs(currentPan.y - boundedPan.y) <= this.focusTolerancePx;
    const noScaleChange = Math.abs(this.currentScale() - scale) <= 0.01;
    if (noPanChange && noScaleChange) return;

    this.panzoom.zoom(scale, { animate, duration: animate ? 260 : 0, force: true });
    this.panzoom.pan(boundedPan.x, boundedPan.y, { animate, duration: animate ? 280 : 0, force: true });
    this.currentScale.set(scale);
  }

  private cancelInitialFocusFrame(): void {
    if (this.initialFocusFrame !== null) {
      cancelAnimationFrame(this.initialFocusFrame);
      this.initialFocusFrame = null;
    }
  }

  private isInitialCenterInTolerance(): boolean {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;
    if (!viewport || !this.panzoom || !content) return true;

    const mapCenterNode = content.querySelector<HTMLElement>('[data-focus-id="map-center"]');
    const nodeCenter = mapCenterNode ? this.resolveCenterInContent(content, mapCenterNode) : null;
    const initialFocusX = (nodeCenter?.x ?? this.mapAnchorX() + VALUE_SECTOR_MAP_LAYOUT.centerX) + this.INITIAL_DATA_FOCUS_OFFSET_X;
    const initialFocusY = (nodeCenter?.y ?? this.mapAnchorY() + VALUE_SECTOR_MAP_LAYOUT.centerY) + this.INITIAL_DATA_FOCUS_OFFSET_Y;
    const expectedPanX = viewport.clientWidth / 2 - initialFocusX * this.INITIAL_DATA_FOCUS_SCALE;
    const expectedPanY = viewport.clientHeight / 2 - initialFocusY * this.INITIAL_DATA_FOCUS_SCALE;
    const bounded = this.clampPan(expectedPanX, expectedPanY, this.INITIAL_DATA_FOCUS_SCALE);
    const current = this.panzoom.getPan();
    const validationTolerance = this.focusTolerancePx + 2;

    return (
      Math.abs(current.x - bounded.x) <= validationTolerance &&
      Math.abs(current.y - bounded.y) <= validationTolerance
    );
  }


  private onPanZoomChange = (): void => {
    if (!this.panzoom) return;
    this.currentScale.set(this.clampScale(this.panzoom.getScale()));
    this.updateProductGroupPosition();
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.panzoom || event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-panzoom-ignore]')) return;
    if (target?.closest('button, a, input, [role="button"]')) return;
    this.isPointerPanning = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.lastPointer = { x: event.clientX, y: event.clientY };
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.panzoom || !this.isPointerPanning) return;
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    const current = this.panzoom.getPan();
    const scale = this.clampScale(this.panzoom.getScale());
    const boundedPan = this.clampPan(current.x + dx, current.y + dy, scale);
    this.panzoom.pan(boundedPan.x, boundedPan.y, { force: true });
    this.lastPointer = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event?: PointerEvent): void => {
    const target = event?.currentTarget as HTMLElement | undefined;
    if (target && event && target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    this.isPointerPanning = false;
  };

  private clampPan(x: number, y: number, scale: number): { x: number; y: number } {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;
    if (!viewport || !content) return { x, y };

    const scaledWidth = content.offsetWidth * scale;
    const scaledHeight = content.offsetHeight * scale;
    const minX = viewport.clientWidth - scaledWidth - this.sceneOverscanX;
    const maxX = this.sceneOverscanX;
    const minY = viewport.clientHeight - scaledHeight - this.sceneOverscanY;
    const maxY = this.sceneOverscanY;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y))
    };
  }

  private setZoomPercent(percent: number): void {
    this.setZoomValue(this.clampScale(percent / 100));
  }

  private setZoomValue(scale: number): void {
    if (!this.panzoom) return;
    const boundedScale = this.clampScale(scale);
    const currentPan = this.panzoom.getPan();
    const boundedPan = this.clampPan(currentPan.x, currentPan.y, boundedScale);

    this.panzoom.zoom(boundedScale, { animate: true, duration: 200, force: true });
    this.panzoom.pan(boundedPan.x, boundedPan.y, { animate: true, duration: 200, force: true });
    this.currentScale.set(boundedScale);
    if (isDevMode()) console.log('[ValueSector] zoom input -> applied scale', boundedScale);
  }

  private clampScale(scale: number): number {
    return Math.min(this.maxScale, Math.max(this.minScale, scale));
  }

  private updateProductGroupPosition(): void {
    const routeId = this.activeRouteId();
    const route = this.activeRoute();
    const mapAnchor = this.mapAnchor?.nativeElement;
    if (!routeId || !route || !mapAnchor) {
      this.productConnectorPathSignal.set(null);
      return;
    }

    const routeCard = mapAnchor.querySelector<HTMLElement>(`[data-route-card-id="${routeId}"]`);
    if (!routeCard) {
      this.productGroupPosition.set(this.productPanelDefault);
      this.productConnectorPathSignal.set(null);
      return;
    }

    const routeCenterX = routeCard.offsetLeft + mapAnchor.offsetLeft;
    const routeCenterY = routeCard.offsetTop + mapAnchor.offsetTop;
    const routeRect = {
      x: routeCenterX - routeCard.offsetWidth / 2,
      y: routeCenterY - routeCard.offsetHeight / 2,
      width: routeCard.offsetWidth,
      height: routeCard.offsetHeight
    };

    const visibleRouteIds = this.items().slice(0, 4).map((item) => item.id);
    const routeIndex = visibleRouteIds.indexOf(routeId);
    const slotOffset =
      routeIndex >= 0
        ? this.PANEL_OFFSET_BY_SLOT[routeIndex]
        : { x: this.productPanelGapX, y: -this.productPanelGapY };

    // Posición hardcodeada basada en la card seleccionada (fácil de tunear con PANEL_OFFSET_BY_SLOT)
    const basePos = {
      x: routeRect.x + slotOffset.x,
      y: routeRect.y + slotOffset.y
    };

    const chosen = {
      x: this.clampWithinSceneX(basePos.x, this.productPanelWidth, 24),
      y: this.clampWithinSceneY(basePos.y, this.productPanelHeight, 180)
    };

    this.productGroupPosition.set(chosen);
    this.updateProductConnector(routeRect, chosen);
  }

  private clampWithinSceneX(value: number, elementSize: number, min: number): number {
    const sceneMax = this.sceneWidth() - elementSize - 24;
    return Math.max(min, Math.min(sceneMax, value));
  }

  private clampWithinSceneY(value: number, elementSize: number, min: number): number {
    const sceneMax = this.sceneHeight() - elementSize - 24;
    return Math.max(min, Math.min(sceneMax, value));
  }

  private updateProductConnector(
    routeRect: { x: number; y: number; width: number; height: number },
    panelPos: { x: number; y: number }
  ): void {
    const panelCenterX = panelPos.x + this.productPanelWidth / 2;

    const fromX = panelCenterX > routeRect.x + routeRect.width / 2 ? routeRect.x + routeRect.width : routeRect.x;
    const fromY = routeRect.y + routeRect.height / 2;

    const routeCenterX = routeRect.x + routeRect.width / 2;
    const routeCenterY = routeRect.y + routeRect.height / 2;
    const isPanelAtRight = panelCenterX > routeCenterX;
    const isPanelAtTop = panelPos.y < routeCenterY;

    // Fallback por panel: borde lateral + altura preferida por cuadrante.
    const fallbackToX = isPanelAtRight
      ? panelPos.x + this.PRODUCT_CONNECTOR_TO_X_LEFT + this.PRODUCT_CONNECTOR_TO_CARD_INSET
      : panelPos.x + this.PRODUCT_CONNECTOR_TO_X_RIGHT - this.PRODUCT_CONNECTOR_TO_CARD_INSET;
    const fallbackToY = panelPos.y + (isPanelAtTop ? this.PRODUCT_CONNECTOR_TO_Y_TOP : this.PRODUCT_CONNECTOR_TO_Y_BOTTOM);

    // Preferido: anclar al borde real de la primera card de producto renderizada.
    const workspace = this.workspaceContent?.nativeElement;
    const panelEl = workspace?.querySelector<HTMLElement>('[data-focus-id="product-panel"]');
    const firstCard = panelEl?.querySelector<HTMLElement>('[data-product-card]');

    let toX = fallbackToX;
    let toY = fallbackToY;

    if (panelEl && firstCard) {
      const panelRect = {
        x: panelPos.x,
        y: panelPos.y
      };
      const cardX = panelRect.x + firstCard.offsetLeft;
      const cardY = panelRect.y + firstCard.offsetTop;
      const cardW = firstCard.offsetWidth;
      const cardH = firstCard.offsetHeight;

      toX = isPanelAtRight
        ? cardX + this.PRODUCT_CONNECTOR_TO_CARD_INSET
        : cardX + cardW - this.PRODUCT_CONNECTOR_TO_CARD_INSET;

      if (isPanelAtTop) {
        toY = cardY + Math.min(cardH * 0.45, this.PRODUCT_CONNECTOR_TO_Y_TOP);
      } else {
        toY = cardY + Math.max(cardH * 0.55, cardH - (this.productPanelHeight - this.PRODUCT_CONNECTOR_TO_Y_BOTTOM));
      }
    }

    const curve = Math.max(44, Math.abs(toX - fromX) * 0.38);
    const c1x = fromX + (toX > fromX ? curve : -curve);
    const c1y = fromY;
    const c2x = toX - (toX > routeCenterX ? curve : -curve);
    const c2y = toY;

    this.productConnectorPathSignal.set({
      fromX,
      fromY,
      c1x,
      c1y,
      c2x,
      c2y,
      toX,
      toY
    });
  }

  private triggerPanelAnimation(): void {
    this.panelAnimate.set(false);
    queueMicrotask(() => this.panelAnimate.set(true));
  }

  private triggerButtonsAnimation(): void {
    this.buttonsAnimate.set(false);
    queueMicrotask(() => this.buttonsAnimate.set(true));
  }

}
