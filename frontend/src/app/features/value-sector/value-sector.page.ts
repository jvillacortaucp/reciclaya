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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideLoaderCircle, LucideMinus, LucidePlus, LucideWandSparkles } from '@lucide/angular';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { ValueSectorFacade } from './application/value-sector.facade';
import { VALUE_SECTOR_TEXT } from './data/value-sector.constants';
import { ValueSectorRoutesMapComponent } from './presentation/components/value-sector-routes-map/value-sector-routes-map.component';
import { ValueSectorProduct, ValueSectorRoute } from './models/value-sector.model';

type ValueSectorFocusTarget = 'map' | `route:${string}` | `product:${string}`;
type ConnectorPoint = { x: number; y: number };
type PanelSide = 'left' | 'right';
type PanelPosition = { x: number; y: number; side: PanelSide };

@Component({
  selector: 'app-value-sector-page',
  standalone: true,
  imports: [
    LucideLoaderCircle,
    LucideMinus,
    LucidePlus,
    LucideWandSparkles,
    ValueSectorRoutesMapComponent,
    RouterLink
  ],
  templateUrl: './value-sector.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(ValueSectorFacade);
  private readonly route = inject(ActivatedRoute);
  private panzoom: PanzoomObject | null = null;

  protected readonly isInitialLoading = this.facade.isInitialLoading;
  protected readonly listingId = this.facade.listingId;
  protected readonly items = this.facade.items;
  protected readonly isGenerating = this.facade.isGenerating;
  protected readonly loadError = this.facade.loadError;
  protected readonly fromListingMode = this.facade.fromListingMode;
  protected readonly listingResidueLabel = this.facade.listingResidueLabel;
  protected readonly text = VALUE_SECTOR_TEXT;
  protected readonly hasUsableData = computed(() => this.items().some((route) => route.products.length > 0));
  protected readonly focusTarget = computed(() => this.currentFocus());
  protected readonly activeRoute = computed<ValueSectorRoute | null>(() => {
    const routeId = this.activeRouteId();
    if (!routeId) {
      return null;
    }
    return this.items().find((item) => item.id === routeId) ?? null;
  });
  protected readonly activeProduct = computed<ValueSectorProduct | null>(() => {
    const route = this.activeRoute();
    const productId = this.activeProductId();
    if (!route || !productId) {
      return null;
    }
    return route.products.find((item) => item.id === productId) ?? null;
  });
  protected readonly hasRouteFocus = computed(() => this.currentFocus() !== 'map');
  protected readonly subtitle = computed(
    () => `${this.items().slice(0, 4).length} industrias detectadas con alto potencial de valorización.`
  );
  protected readonly routeConnectorStart = computed(() => this.routeConnectorPoint());
  protected readonly productConnectorStart = computed(() => this.productConnectorPoint());
  protected readonly routePanelStyles = computed(() => {
    const panel = this.routePanelPosition();
    if (!panel) {
      return null;
    }
    return { left: `${panel.x}px`, top: `${panel.y}px` };
  });
  protected readonly detailPanelStyles = computed(() => {
    const panel = this.detailPanelPosition();
    if (!panel) {
      return null;
    }
    return { left: `${panel.x}px`, top: `${panel.y}px` };
  });
  protected readonly routePanel = computed(() => this.routePanelPosition());
  protected readonly detailPanel = computed(() => this.detailPanelPosition());
  protected readonly minZoomPercent = 55;
  protected readonly maxZoomPercent = 190;
  protected readonly zoomPercent = computed(() => Math.round(this.currentScale() * 100));
  protected readonly zoomPercentLabel = computed(() => `${this.zoomPercent()}%`);

  @ViewChild('workspaceViewport') private workspaceViewport?: ElementRef<HTMLDivElement>;
  @ViewChild('workspaceContent') private workspaceContent?: ElementRef<HTMLDivElement>;
  @ViewChild('mapAnchor') private mapAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('routeAnchor') private routeAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('detailAnchor') private detailAnchor?: ElementRef<HTMLDivElement>;

  private readonly currentFocus = signal<ValueSectorFocusTarget>('map');
  private readonly activeRouteId = signal<string | null>(null);
  private readonly activeProductId = signal<string | null>(null);
  private readonly history = signal<readonly ValueSectorFocusTarget[]>([]);
  private readonly routeConnectorPoint = signal<ConnectorPoint | null>(null);
  private readonly productConnectorPoint = signal<ConnectorPoint | null>(null);
  private readonly routePanelPosition = signal<PanelPosition | null>(null);
  private readonly detailPanelPosition = signal<PanelPosition | null>(null);
  private readonly currentScale = signal(0.88);

  private readonly scenePadding = 36;
  private readonly sceneOverscanX = 1200;
  private readonly sceneOverscanY = 700;
  private readonly minScale = 0.55;
  private readonly maxScale = 1.9;
  private readonly zoomStep = 0.08;
  private readonly routePanelWidth = 900;
  private readonly routePanelHeight = 470;
  private readonly detailPanelWidth = 620;
  private readonly detailPanelHeight = 520;
  private isClampingPan = false;
  private isPointerPanning = false;
  private lastPointer = { x: 0, y: 0 };

  constructor() {
    effect(() => {
      const routes = this.items();
      if (!routes.length || this.activeProductId()) {
        return;
      }
      const firstUsable = routes.find((route) => route.products.length > 0);
      if (!firstUsable) {
        return;
      }
      const firstProduct = firstUsable.products[0];
      this.activeRouteId.set(firstUsable.id);
      this.activeProductId.set(firstProduct.id);
      this.facade.selectProduct(firstUsable.id, firstProduct.id);
      queueMicrotask(() => {
        this.focusMap();
      });
    });

    effect(() => {
      const totalRoutes = this.items().length;
      if (!totalRoutes) {
        this.teardownPanzoom();
        return;
      }

      queueMicrotask(() => this.tryInitPanzoom());
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const listingId = params.get('listing');
      const shouldRestoreScroll = this.facade.hasLoadedListing(listingId);
      this.facade.initialize(listingId);
      this.currentFocus.set('map');
      this.history.set([]);
      this.activeRouteId.set(null);
      this.activeProductId.set(null);
      this.routeConnectorPoint.set(null);
      this.productConnectorPoint.set(null);
      this.routePanelPosition.set(null);
      this.detailPanelPosition.set(null);

      if (shouldRestoreScroll) {
        queueMicrotask(() => {
          window.scrollTo({
            top: this.facade.getRememberedScrollPosition(),
            behavior: 'auto'
          });
        });
      }

      queueMicrotask(() => this.focusMap());
    });
  }

  ngAfterViewInit(): void {
    this.tryInitPanzoom();
  }

  ngOnDestroy(): void {
    this.teardownPanzoom();
  }

  protected onRouteSelected(routeId: string): void {
    const route = this.items().find((item) => item.id === routeId);
    if (!route) {
      return;
    }

    this.activeRouteId.set(routeId);

    const firstProductId = route.products[0]?.id ?? null;
    this.activeProductId.set(firstProductId);

    if (firstProductId) {
      this.facade.selectProduct(route.id, firstProductId);
    }

    queueMicrotask(() => {
      this.focusMap();
    });

    this.moveToFocus(firstProductId ? `product:${firstProductId}` : `route:${routeId}`);
  }

  protected onProductSelected(productId: string): void {
    const route = this.activeRoute();
    if (!route) {
      return;
    }

    this.activeProductId.set(productId);
    this.facade.selectProduct(route.id, productId);
    this.moveToFocus(`product:${productId}`);
  }

  protected onGenerateRequested(): void {
    this.facade.generateForSelectedListing();
  }

  protected onBackRequested(): void {
    const previous = [...this.history()];
    const last = previous.pop();
    if (!last) {
      return;
    }

    this.history.set(previous);
    this.currentFocus.set(last);
    if (last === 'map') {
      this.activeRouteId.set(null);
      this.activeProductId.set(null);
      this.focusMap();
      return;
    }

    if (last.startsWith('route:')) {
      this.activeProductId.set(null);
      return;
    }
  }

  protected retryLoad(): void {
    this.facade.initialize(this.listingId());
    this.currentFocus.set('map');
    this.history.set([]);
    this.activeRouteId.set(null);
    this.activeProductId.set(null);
    queueMicrotask(() => this.focusMap());
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
    if (!Number.isFinite(value)) {
      return;
    }
    if (!this.panzoom && isDevMode()) {
      console.log('[ValueSector] zoom input ignored: panzoom not initialized yet');
    }
    this.setZoomPercent(value);
  }

  private tryInitPanzoom(): void {
    if (this.panzoom) {
      return;
    }

    const content = this.workspaceContent?.nativeElement;
    const viewport = this.workspaceViewport?.nativeElement;
    if (!content || !viewport) {
      return;
    }

    this.panzoom = Panzoom(content, {
      minScale: this.minScale,
      maxScale: this.maxScale,
      step: 0.06,
      startScale: 0.88,
      canvas: true
    });
    this.currentScale.set(this.clampScale(this.panzoom.getScale()));

    content.addEventListener('panzoomchange', this.onPanZoomChange);
    viewport.addEventListener('wheel', this.panzoom.zoomWithWheel, { passive: false });
    viewport.addEventListener('pointerdown', this.onPointerDown);
    viewport.addEventListener('pointermove', this.onPointerMove);
    viewport.addEventListener('pointerup', this.onPointerUp);
    viewport.addEventListener('pointercancel', this.onPointerUp);

    if (isDevMode()) {
      console.log('[ValueSector] Panzoom initialized');
    }

    queueMicrotask(() => this.focusMap());
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
      if (isDevMode()) {
        console.log('[ValueSector] Panzoom destroyed');
      }
    }
  }

  private moveToFocus(nextTarget: ValueSectorFocusTarget): void {
    if (this.currentFocus() === nextTarget) {
      return;
    }

    this.history.set([...this.history(), this.currentFocus()]);
    this.currentFocus.set(nextTarget);
  }

  private focusMap(): void {
    this.focusElement(this.mapAnchor?.nativeElement, 0.9);
  }

  private focusRoute(_routeId: string): void {
    this.focusMap();
  }

  private focusProduct(_productId: string): void {
    this.focusMap();
  }

  private focusElement(element: HTMLElement | undefined, scale: number): void {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;
    if (!element || !viewport || !content || !this.panzoom) {
      return;
    }

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    const targetCenterX = element.offsetLeft + element.offsetWidth / 2;
    const targetCenterY = element.offsetTop + element.offsetHeight / 2;

    const panX = viewportWidth / 2 - targetCenterX * scale;
    const panY = viewportHeight / 2 - targetCenterY * scale;
    const boundedPan = this.clampPan(panX, panY, scale);

    this.panzoom.zoom(scale, { animate: true, duration: 320 });
    this.panzoom.pan(boundedPan.x, boundedPan.y, { animate: true, duration: 360 });
    this.currentScale.set(scale);
  }

  private captureRouteConnectorPoint(_routeId: string): void {}
  private captureProductConnectorPoint(_productId: string): void {}

  private computeRoutePanelPosition(_routeId: string): void {}
  private computeDetailPanelPosition(_productId: string): void {}

  private clampSceneX(value: number, elementWidth: number): number {
    const contentWidth = this.workspaceContent?.nativeElement.offsetWidth ?? 0;
    const min = this.scenePadding;
    const max = Math.max(min, contentWidth - elementWidth - this.scenePadding);
    return Math.min(max, Math.max(min, value));
  }

  private clampSceneY(value: number, elementHeight: number): number {
    const contentHeight = this.workspaceContent?.nativeElement.offsetHeight ?? 0;
    const min = 240;
    const max = Math.max(min, contentHeight - elementHeight - this.scenePadding);
    return Math.min(max, Math.max(min, value));
  }

  private onPanZoomChange = (): void => {
    if (!this.panzoom) {
      return;
    }
    this.currentScale.set(this.clampScale(this.panzoom.getScale()));
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.panzoom) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-panzoom-ignore]')) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    this.isPointerPanning = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.lastPointer = { x: event.clientX, y: event.clientY };
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.panzoom || !this.isPointerPanning) {
      return;
    }
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
    if (target && event && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    this.isPointerPanning = false;
  };

  private clampPan(x: number, y: number, scale: number): { x: number; y: number } {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;
    if (!viewport || !content) {
      return { x, y };
    }

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
    const normalized = this.clampScale(percent / 100);
    this.setZoomValue(normalized);
  }

  private setZoomValue(scale: number): void {
    if (!this.panzoom) {
      return;
    }

    const boundedScale = this.clampScale(scale);
    const viewport = this.workspaceViewport?.nativeElement;
    if (!viewport) {
      return;
    }

    this.panzoom.zoom(boundedScale, { animate: true, duration: 220, force: true });

    const currentPan = this.panzoom.getPan();
    const boundedPan = this.clampPan(currentPan.x, currentPan.y, boundedScale);
    this.panzoom.pan(boundedPan.x, boundedPan.y, { animate: true, duration: 220 });
    this.currentScale.set(boundedScale);
    if (isDevMode()) {
      console.log('[ValueSector] zoom input -> applied scale', boundedScale);
    }
  }

  private clampScale(scale: number): number {
    return Math.min(this.maxScale, Math.max(this.minScale, scale));
  }
}
