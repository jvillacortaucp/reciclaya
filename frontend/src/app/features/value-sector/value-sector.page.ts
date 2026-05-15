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
  private readonly facade = inject(ValueSectorFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private panzoom: PanzoomObject | null = null;
  private isPointerPanning = false;
  private lastPointer = { x: 0, y: 0 };

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

  // Canonical scene geometry (single source of truth)
  protected readonly sceneWidth = 2200;
  protected readonly sceneHeight = 1300;
  protected readonly mapAnchorX = 700;
  protected readonly mapAnchorY = 300;
  protected readonly mapAnchorWidth = 860;

  protected readonly mapAnchorStyles = computed(() => ({
    left: `${this.mapAnchorX}px`,
    top: `${this.mapAnchorY}px`,
    width: `${this.mapAnchorWidth}px`
  }));
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
  private readonly currentScale = signal(0.88);

  private readonly sceneOverscanX = 1000;
  private readonly sceneOverscanY = 680;
  private readonly minScale = 0.55;
  private readonly maxScale = 1.9;
  private readonly zoomStep = 0.08;
  private readonly productGroupWidth = 360;
  private readonly productGroupHeight = 460;
  private readonly productPanelGap = 24;
  private readonly productPanelDefault = { x: 1360, y: 360 };
  private readonly onWindowResize = () => this.updateProductGroupPosition();

  constructor() {
    effect(() => {
      if (!this.items().length) {
        this.teardownPanzoom();
        return;
      }
      queueMicrotask(() => this.tryInitPanzoom());
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
    this.tryInitPanzoom();
    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    this.teardownPanzoom();
    window.removeEventListener('resize', this.onWindowResize);
  }

  protected onRouteSelected(routeId: string): void {
    const route = this.items().find((item) => item.id === routeId);
    if (!route) return;

    this.activeRouteId.set(routeId);
    this.activeProductId.set(null);
    this.buttonsAnimate.set(false);
    queueMicrotask(() => this.updateProductGroupPosition());
  }

  protected onProductSelected(productId: string): void {
    const route = this.activeRoute();
    if (!route) return;
    this.activeProductId.set(productId);
    this.facade.selectProduct(route.id, productId);
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
    queueMicrotask(() => this.focusMap());
  }

  protected onBackRequested(): void {
    this.activeRouteId.set(null);
    this.activeProductId.set(null);
    this.panelAnimate.set(false);
    this.buttonsAnimate.set(false);
    this.focusMap();
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

    if (isDevMode()) console.log('[ValueSector] Panzoom initialized');
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
      if (isDevMode()) console.log('[ValueSector] Panzoom destroyed');
    }
  }

  private focusMap(): void {
    this.focusElement(this.mapAnchor?.nativeElement, 0.88);
    this.updateProductGroupPosition();
  }

  private focusElement(element: HTMLElement | undefined, scale: number): void {
    const viewport = this.workspaceViewport?.nativeElement;
    const content = this.workspaceContent?.nativeElement;
    if (!element || !viewport || !content || !this.panzoom) return;

    const targetCenterX = element.offsetLeft + element.offsetWidth / 2;
    const targetCenterY = element.offsetTop + element.offsetHeight / 2;
    const panX = viewport.clientWidth / 2 - targetCenterX * scale;
    const panY = viewport.clientHeight / 2 - targetCenterY * scale;
    const boundedPan = this.clampPan(panX, panY, scale);

    this.panzoom.zoom(scale, { animate: true, duration: 260, force: true });
    this.panzoom.pan(boundedPan.x, boundedPan.y, { animate: true, duration: 280, force: true });
    this.currentScale.set(scale);
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
    const workspace = this.workspaceContent?.nativeElement;
    if (!routeId || !route || !mapAnchor || !workspace) {
      this.productConnectorPathSignal.set(null);
      return;
    }

    const routeCard = mapAnchor.querySelector<HTMLElement>(`[data-route-card-id="${routeId}"]`);
    if (!routeCard) {
      this.productGroupPosition.set(this.productPanelDefault);
      this.productConnectorPathSignal.set(null);
      return;
    }

    const routeRect = {
      x: routeCard.offsetLeft + mapAnchor.offsetLeft,
      y: routeCard.offsetTop + mapAnchor.offsetTop,
      width: routeCard.offsetWidth,
      height: routeCard.offsetHeight
    };

    const allRouteRects = Array.from(mapAnchor.querySelectorAll<HTMLElement>('[data-route-card-id]'))
      .filter((item) => item.dataset['routeCardId'] !== routeId)
      .map((item) => ({
        x: item.offsetLeft + mapAnchor.offsetLeft,
        y: item.offsetTop + mapAnchor.offsetTop,
        width: item.offsetWidth,
        height: item.offsetHeight
      }));

    const routeCenterX = routeRect.x + routeRect.width / 2;
    const routeCenterY = routeRect.y + routeRect.height / 2;
    const candidates = [
      { x: routeRect.x + routeRect.width + this.productPanelGap, y: routeRect.y - 24 }, // right-top
      { x: routeRect.x + routeRect.width + this.productPanelGap, y: routeRect.y + routeRect.height - this.productGroupHeight + 24 }, // right-bottom
      { x: routeRect.x - this.productGroupWidth - this.productPanelGap, y: routeRect.y - 24 }, // left-top
      { x: routeRect.x - this.productGroupWidth - this.productPanelGap, y: routeRect.y + routeRect.height - this.productGroupHeight + 24 } // left-bottom
    ].map((candidate) => ({
      x: this.clampWithinSceneX(candidate.x, this.productGroupWidth, 24),
      y: this.clampWithinSceneY(candidate.y, this.productGroupHeight, 180)
    }));

    const area = (rectA: { x: number; y: number; width: number; height: number }, rectB: { x: number; y: number; width: number; height: number }): number => {
      const overlapX = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x));
      const overlapY = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y));
      return overlapX * overlapY;
    };

    let chosen = candidates[0];
    let bestScore = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
      const panelRect = { x: candidate.x, y: candidate.y, width: this.productGroupWidth, height: this.productGroupHeight };
      const overlap = allRouteRects.reduce((sum, routeBox) => sum + area(panelRect, routeBox), 0);
      const panelCenterX = panelRect.x + panelRect.width / 2;
      const panelCenterY = panelRect.y + panelRect.height / 2;
      const distance = Math.hypot(panelCenterX - routeCenterX, panelCenterY - routeCenterY);
      const score = overlap * 1000 + distance;
      if (score < bestScore) {
        bestScore = score;
        chosen = candidate;
      }
      if (overlap === 0) {
        chosen = candidate;
        break;
      }
    }

    this.productGroupPosition.set(chosen);
    this.updateProductConnector(routeRect, chosen);
  }

  private clampWithinSceneX(value: number, elementSize: number, min: number): number {
    const sceneMax = this.sceneWidth - elementSize - 24;
    return Math.max(min, Math.min(sceneMax, value));
  }

  private clampWithinSceneY(value: number, elementSize: number, min: number): number {
    const sceneMax = this.sceneHeight - elementSize - 24;
    return Math.max(min, Math.min(sceneMax, value));
  }

  private updateProductConnector(
    routeRect: { x: number; y: number; width: number; height: number },
    panelPos: { x: number; y: number }
  ): void {
    const panelCenterX = panelPos.x + this.productGroupWidth / 2;

    const fromX = panelCenterX > routeRect.x + routeRect.width / 2 ? routeRect.x + routeRect.width : routeRect.x;
    const fromY = routeRect.y + routeRect.height / 2;

    const routeCenterX = routeRect.x + routeRect.width / 2;
    const routeCenterY = routeRect.y + routeRect.height / 2;

    const toX = panelCenterX > routeCenterX ? panelPos.x : panelPos.x + this.productGroupWidth;
    const toY = Math.max(panelPos.y + 26, Math.min(panelPos.y + this.productGroupHeight - 26, routeCenterY));

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
