import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry, Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { LocalGeoJsonService } from 'app/core/services/local-geojson.service';
import { BuyerScope, PotentialBuyer } from './potential-buyers-map.models';
import {
  buildBuyerTooltipMarkup,
  findMatchingCountryFeatures,
  findMatchingFeatures,
  normalizeGeoName,
  resolveFocusBuyer
} from './potential-buyers-map.utils';

type MapTabOption = { readonly id: BuyerScope; readonly label: string };

const SCOPE_OPTIONS: readonly MapTabOption[] = [
  { id: 'national', label: 'Nacional' },
  { id: 'international', label: 'Internacional' }
];

const DEFAULT_CENTERS: Record<BuyerScope, [number, number]> = {
  national: [-75.0152, -9.1899],
  international: [-77.04, -12.04]
};

const DEFAULT_ZOOMS: Record<BuyerScope, number> = {
  national: 5.2,
  international: 3.2
};

const TOOLTIP_VIEWPORT_PADDING = 16;
const TOOLTIP_PRIMARY_OFFSET = 16;
const TOOLTIP_SIDE_OFFSET = 18;

type TooltipOrientation = 'top' | 'bottom' | 'left' | 'right';
type TooltipPlacement = {
  readonly orientation: TooltipOrientation;
  readonly positioning: 'bottom-center' | 'top-center' | 'center-left' | 'center-right';
  readonly offset: [number, number];
};

@Component({
  selector: 'app-potential-buyers-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './potential-buyers-map.component.html',
  styleUrl: './potential-buyers-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PotentialBuyersMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) private readonly mapHost?: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipEl', { static: true }) private readonly tooltipEl?: ElementRef<HTMLDivElement>;

  buyers = input<readonly PotentialBuyer[]>([]);
  initialScope = input<BuyerScope>('national');
  controlledScope = input<BuyerScope | null>(null);
  nationalRegion = input<string | null>(null);
  internationalCountryIso3 = input<string | null>(null);
  internationalCountryName = input<string | null>(null);
  mapHeight = input(420);
  showInternalTabs = input(true);

  buyerSelected = output<PotentialBuyer>();
  scopeChanged = output<BuyerScope>();

  protected readonly loading = signal(false);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly selectedBuyer = signal<PotentialBuyer | null>(null);
  protected readonly activeScope = computed<BuyerScope>(() => this.controlledScope() ?? this.internalScope());
  protected readonly scopeOptions = SCOPE_OPTIONS;
  protected readonly mapStyleHeight = computed(() => `${Math.max(this.mapHeight(), 680)}px`);

  private readonly ngZone = inject(NgZone);
  private readonly localGeoJsonService = inject(LocalGeoJsonService);
  private readonly internalScope = signal<BuyerScope>('national');

  private map?: OlMap;
  private view?: View;
  private polygonLayer?: VectorLayer<VectorSource<Feature<Geometry>>>;
  private markerLayer?: VectorLayer<VectorSource<Feature<Point>>>;
  private tooltipOverlay?: Overlay;
  private rendered = false;
  private renderRequestId = 0;

  constructor() {
    effect(() => {
      if (this.controlledScope() === null) {
        this.internalScope.set(this.initialScope());
      }
    });

    effect(() => {
      this.buyers();
      this.activeScope();
      this.nationalRegion();
      this.internationalCountryIso3();
      this.internationalCountryName();
      this.mapHeight();

      if (!this.rendered) {
        return;
      }

      this.queueRender();
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeMap();
      this.rendered = true;
      this.queueRender();
    });
  }

  ngOnDestroy(): void {
    if (this.tooltipOverlay) {
      this.tooltipOverlay.setPosition(undefined);
    }
    this.map?.setTarget(undefined);
  }

  protected isActiveScope(scope: BuyerScope): boolean {
    return this.activeScope() === scope;
  }

  protected selectScope(scope: BuyerScope): void {
    if (this.controlledScope() === null) {
      this.internalScope.set(scope);
    }

    this.scopeChanged.emit(scope);
  }

  protected zoomIn(): void {
    if (!this.view) {
      return;
    }

    const zoom = this.view.getZoom() ?? DEFAULT_ZOOMS[this.activeScope()];
    this.view.animate({ zoom: Math.min(zoom + 1, 12), duration: 180 });
  }

  protected zoomOut(): void {
    if (!this.view) {
      return;
    }

    const zoom = this.view.getZoom() ?? DEFAULT_ZOOMS[this.activeScope()];
    this.view.animate({ zoom: Math.max(zoom - 1, 2.5), duration: 180 });
  }

  private initializeMap(): void {
    if (!this.mapHost || !this.tooltipEl) {
      return;
    }

    this.view = new View({
      center: fromLonLat(DEFAULT_CENTERS[this.activeScope()]),
      zoom: DEFAULT_ZOOMS[this.activeScope()],
      minZoom: 2.5,
      maxZoom: 12
    });

    this.polygonLayer = new VectorLayer({
      source: new VectorSource<Feature<Geometry>>(),
      style: this.createPolygonStyle(false),
      zIndex: 10
    });

    this.markerLayer = new VectorLayer({
      source: new VectorSource<Feature<Point>>(),
      style: this.createMarkerStyle(),
      zIndex: 20
    });

    this.tooltipOverlay = new Overlay({
      element: this.tooltipEl.nativeElement,
      offset: [0, -16],
      positioning: 'bottom-center',
      stopEvent: false
    });

    this.map = new OlMap({
      target: this.mapHost.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM(),
          opacity: 0.34,
          zIndex: 1
        }),
        this.polygonLayer,
        this.markerLayer
      ],
      overlays: [this.tooltipOverlay],
      view: this.view,
      controls: []
    });

    this.map.on('pointermove', (event) => {
      if (!this.map || event.dragging) {
        this.hideTooltip();
        return;
      }

      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (candidate) => candidate as Feature<Point> | undefined,
        { layerFilter: (layer) => layer === this.markerLayer }
      );

      if (!feature) {
        this.hideTooltip();
        this.updateCursor('');
        return;
      }

      const buyer = feature.get('buyer') as PotentialBuyer | undefined;
      const geometry = feature.getGeometry();
      if (!buyer || !geometry || !this.tooltipOverlay || !this.tooltipEl) {
        this.hideTooltip();
        this.updateCursor('');
        return;
      }

      this.tooltipEl.nativeElement.innerHTML = buildBuyerTooltipMarkup(buyer);
      this.tooltipEl.nativeElement.style.display = 'block';
      this.positionTooltip((geometry as Point), event.pixel);
      this.updateCursor('pointer');
    });

    this.map.on('singleclick', (event) => {
      if (!this.map) {
        return;
      }

      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (candidate) => candidate as Feature<Point> | undefined,
        { layerFilter: (layer) => layer === this.markerLayer }
      );
      const buyer = feature?.get('buyer') as PotentialBuyer | undefined;
      if (!buyer) {
        return;
      }

      this.ngZone.run(() => {
        this.selectedBuyer.set(buyer);
        this.buyerSelected.emit(buyer);
      });
    });
  }

  private queueRender(): void {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        void this.renderScope();
      });
    });
  }

  private async renderScope(): Promise<void> {
    if (!this.map || !this.view || !this.polygonLayer || !this.markerLayer) {
      return;
    }

    const requestId = ++this.renderRequestId;
    const scope = this.activeScope();
    const buyers = this.resolveVisibleBuyers(scope);
    const focusBuyer = resolveFocusBuyer(
      buyers,
      scope,
      this.nationalRegion(),
      this.internationalCountryIso3()
    );

    this.ngZone.run(() => {
      this.loading.set(true);
      this.statusMessage.set(null);
    });

    const boundary = await this.loadBoundary(scope, focusBuyer);
    if (requestId !== this.renderRequestId) {
      return;
    }

    const features = boundary
      ? new GeoJSON().readFeatures(boundary, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      : [];

    const matchedFeatures =
      scope === 'national'
        ? findMatchingFeatures(features, scope, this.resolveRegionNames(buyers, focusBuyer))
        : findMatchingCountryFeatures(
            features,
            this.resolveCountryNames(buyers, focusBuyer),
            this.resolveCountryIso3s(buyers, focusBuyer)
          );

    const polygonSource = new VectorSource<Feature<Geometry>>({
      features: [...matchedFeatures]
    });
    this.polygonLayer.setSource(polygonSource);
    this.polygonLayer.setStyle(this.createPolygonStyle(true));

    const filteredBuyers = this.filterBuyersForMarkers(buyers, scope, focusBuyer);
    const markerFeatures = filteredBuyers.map((buyer) => this.createMarkerFeature(buyer));
    const markerSource = new VectorSource<Feature<Point>>({ features: markerFeatures });
    this.markerLayer.setSource(markerSource);

    let status: string | null = null;
    if (!boundary) {
      status =
        scope === 'international'
          ? 'No se pudo cargar el país seleccionado. Verifica countries.geojson'
          : 'No se pudo cargar el archivo GeoJSON.';
    } else if (!matchedFeatures.length) {
      status = 'No se pudo encontrar el área geográfica seleccionada.';
    } else if (!filteredBuyers.length) {
      status =
        scope === 'national'
          ? 'No se encontraron compradores nacionales para esta región.'
          : 'No se encontraron compradores internacionales para este país.';
    }

    const expectedGeoCount =
      scope === 'national'
        ? this.resolveRegionNames(buyers, focusBuyer).length
        : Math.max(this.resolveCountryIso3s(buyers, focusBuyer).length, this.resolveCountryNames(buyers, focusBuyer).length);
    if (boundary && matchedFeatures.length && matchedFeatures.length < expectedGeoCount) {
      console.warn('[PotentialBuyersMap] Cobertura geográfica parcial', {
        scope,
        expectedGeoCount,
        matchedFeatureCount: matchedFeatures.length
      });
    }

    this.fitMap(polygonSource, markerSource, scope);

    this.ngZone.run(() => {
      this.loading.set(false);
      this.statusMessage.set(status);
    });
  }

  private resolveVisibleBuyers(scope: BuyerScope): readonly PotentialBuyer[] {
    return this.buyers().filter((buyer) => buyer.scope === scope);
  }

  private filterBuyersForMarkers(
    buyers: readonly PotentialBuyer[],
    scope: BuyerScope,
    focusBuyer: PotentialBuyer | null
  ): readonly PotentialBuyer[] {
    if (scope === 'national') {
      const allowedRegions = new Set(
        this.resolveRegionNames(buyers, focusBuyer)
          .map((region) => normalizeGeoName(region))
          .filter((region) => !!region)
      );

      if (!allowedRegions.size) {
        return buyers;
      }

      return buyers.filter((buyer) => allowedRegions.has(normalizeGeoName(buyer.region)));
    }

    const allowedIso3 = new Set(
      this.resolveCountryIso3s(buyers, focusBuyer)
        .map((countryIso3) => normalizeGeoName(countryIso3))
        .filter((countryIso3) => !!countryIso3)
    );
    const allowedCountries = new Set(
      this.resolveCountryNames(buyers, focusBuyer)
        .map((country) => normalizeGeoName(country))
        .filter((country) => !!country)
    );

    if (!allowedIso3.size && !allowedCountries.size) {
      return buyers;
    }

    return buyers.filter((buyer) => {
      const buyerIso = normalizeGeoName(buyer.countryIso3);
      const buyerCountry = normalizeGeoName(buyer.country);
      return (buyerIso && allowedIso3.has(buyerIso)) || (buyerCountry && allowedCountries.has(buyerCountry));
    });
  }

  private async loadBoundary(scope: BuyerScope, focusBuyer: PotentialBuyer | null): Promise<unknown | null> {
    if (scope === 'national') {
      return this.localGeoJsonService.getPeruAdm1GeoJson();
    }

    return this.localGeoJsonService.getCountriesGeoJson();
  }

  private resolveCountryIso3(focusBuyer: PotentialBuyer | null): string | null {
    return this.internationalCountryIso3() ?? focusBuyer?.countryIso3 ?? null;
  }

  private resolveCountryName(focusBuyer: PotentialBuyer | null): string | null {
    return this.internationalCountryName() ?? focusBuyer?.country ?? null;
  }

  private resolveRegionName(focusBuyer: PotentialBuyer | null): string | null {
    return this.nationalRegion() ?? focusBuyer?.region ?? null;
  }

  private resolveRegionNames(
    buyers: readonly PotentialBuyer[],
    focusBuyer: PotentialBuyer | null
  ): readonly string[] {
    if (this.nationalRegion()) {
      return [this.nationalRegion()!];
    }

    const uniqueRegions = Array.from(
      new Set(
        buyers
          .map((buyer) => buyer.region)
          .filter((region): region is string => typeof region === 'string' && !!normalizeGeoName(region))
      )
    );

    return uniqueRegions.length ? uniqueRegions : focusBuyer?.region ? [focusBuyer.region] : [];
  }

  private resolveCountryIso3s(
    buyers: readonly PotentialBuyer[],
    focusBuyer: PotentialBuyer | null
  ): readonly string[] {
    if (this.internationalCountryIso3()) {
      return [this.internationalCountryIso3()!];
    }

    const uniqueIso3s = Array.from(
      new Set(
        buyers
          .map((buyer) => buyer.countryIso3)
          .filter((countryIso3): countryIso3 is string => typeof countryIso3 === 'string' && !!normalizeGeoName(countryIso3))
      )
    );

    return uniqueIso3s.length ? uniqueIso3s : focusBuyer?.countryIso3 ? [focusBuyer.countryIso3] : [];
  }

  private resolveCountryNames(
    buyers: readonly PotentialBuyer[],
    focusBuyer: PotentialBuyer | null
  ): readonly string[] {
    if (this.internationalCountryName()) {
      return [this.internationalCountryName()!];
    }

    const uniqueCountries = Array.from(
      new Set(
        buyers
          .map((buyer) => buyer.country)
          .filter((country): country is string => typeof country === 'string' && !!normalizeGeoName(country))
      )
    );

    return uniqueCountries.length ? uniqueCountries : focusBuyer?.country ? [focusBuyer.country] : [];
  }

  private fitMap(
    polygonSource: VectorSource<Feature<Geometry>>,
    markerSource: VectorSource<Feature<Point>>,
    scope: BuyerScope
  ): void {
    if (!this.view) {
      return;
    }

    if (polygonSource.getFeatures().length) {
      const polygonExtent = polygonSource.getExtent();
      if (!polygonExtent) {
        return;
      }

      this.view.fit(polygonExtent, {
        padding: [32, 32, 32, 32],
        duration: 320,
        maxZoom: scope === 'national' ? 8.2 : 5.6
      });
      return;
    }

    if (markerSource.getFeatures().length) {
      const markerExtent = markerSource.getExtent();
      if (!markerExtent) {
        return;
      }

      this.view.fit(markerExtent, {
        padding: [42, 42, 42, 42],
        duration: 320,
        maxZoom: scope === 'national' ? 8.5 : 6
      });
      return;
    }

    this.view.animate({
      center: fromLonLat(DEFAULT_CENTERS[scope]),
      zoom: DEFAULT_ZOOMS[scope],
      duration: 220
    });
  }

  private createMarkerFeature(buyer: PotentialBuyer): Feature<Point> {
    const feature = new Feature<Point>({
      geometry: new Point(fromLonLat([buyer.longitude, buyer.latitude]))
    });
    feature.set('buyer', buyer);
    return feature;
  }

  private createMarkerStyle(): Style {
    return new Style({
      image: new CircleStyle({
        radius: 8.5,
        fill: new Fill({ color: '#059669' }),
        stroke: new Stroke({ color: '#ffffff', width: 2.5 })
      })
    });
  }

  private createPolygonStyle(isActive: boolean): Style {
    return new Style({
      fill: new Fill({
        color: isActive ? 'rgba(16, 185, 129, 0.22)' : 'rgba(148, 163, 184, 0.08)'
      }),
      stroke: new Stroke({
        color: isActive ? '#10b981' : 'rgba(148, 163, 184, 0.22)',
        width: isActive ? 2.6 : 1
      })
    });
  }

  private hideTooltip(): void {
    if (this.tooltipOverlay) {
      this.tooltipOverlay.setPosition(undefined);
    }
    if (this.tooltipEl) {
      this.tooltipEl.nativeElement.style.display = 'none';
      this.tooltipEl.nativeElement.classList.remove(
        'potential-buyers-map__tooltip--top',
        'potential-buyers-map__tooltip--bottom',
        'potential-buyers-map__tooltip--left',
        'potential-buyers-map__tooltip--right'
      );
    }
  }

  private updateCursor(cursor: string): void {
    const target = this.map?.getTargetElement();
    if (target) {
      target.style.cursor = cursor;
    }
  }

  private positionTooltip(geometry: Point, pixel: number[]): void {
    if (!this.map || !this.tooltipOverlay || !this.tooltipEl) {
      return;
    }

    const tooltipElement = this.tooltipEl.nativeElement;
    const mapElement = this.map.getTargetElement();
    if (!mapElement) {
      this.tooltipOverlay.setPosition(geometry.getCoordinates());
      return;
    }

    const mapRect = mapElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const placement = this.selectTooltipPlacement(pixel, mapRect, tooltipRect);

    tooltipElement.classList.remove(
      'potential-buyers-map__tooltip--top',
      'potential-buyers-map__tooltip--bottom',
      'potential-buyers-map__tooltip--left',
      'potential-buyers-map__tooltip--right'
    );
    tooltipElement.classList.add(`potential-buyers-map__tooltip--${placement.orientation}`);

    this.tooltipOverlay.setPositioning(placement.positioning);
    this.tooltipOverlay.setOffset(placement.offset);
    this.tooltipOverlay.setPosition(geometry.getCoordinates());
  }

  private selectTooltipPlacement(
    pixel: number[],
    mapRect: DOMRect,
    tooltipRect: DOMRect
  ): TooltipPlacement {
    const [pixelX, pixelY] = pixel;
    const tooltipWidth = tooltipRect.width || 320;
    const tooltipHeight = tooltipRect.height || 220;
    const availableTop = pixelY - TOOLTIP_VIEWPORT_PADDING;
    const availableBottom = mapRect.height - pixelY - TOOLTIP_VIEWPORT_PADDING;
    const availableLeft = pixelX - TOOLTIP_VIEWPORT_PADDING;
    const availableRight = mapRect.width - pixelX - TOOLTIP_VIEWPORT_PADDING;

    const placements: readonly TooltipPlacement[] = [
      {
        orientation: 'top',
        positioning: 'bottom-center',
        offset: [0, -TOOLTIP_PRIMARY_OFFSET]
      },
      {
        orientation: 'bottom',
        positioning: 'top-center',
        offset: [0, TOOLTIP_PRIMARY_OFFSET]
      },
      {
        orientation: 'right',
        positioning: 'center-left',
        offset: [TOOLTIP_SIDE_OFFSET, 0]
      },
      {
        orientation: 'left',
        positioning: 'center-right',
        offset: [-TOOLTIP_SIDE_OFFSET, 0]
      }
    ];

    const scores = new Map<TooltipOrientation, number>([
      ['top', this.scoreTooltipPlacement(availableTop, tooltipHeight, availableLeft, availableRight, tooltipWidth)],
      ['bottom', this.scoreTooltipPlacement(availableBottom, tooltipHeight, availableLeft, availableRight, tooltipWidth)],
      ['right', this.scoreTooltipPlacement(availableRight, tooltipWidth, availableTop, availableBottom, tooltipHeight)],
      ['left', this.scoreTooltipPlacement(availableLeft, tooltipWidth, availableTop, availableBottom, tooltipHeight)]
    ]);

    return [...placements].sort((left, right) => {
      const scoreDelta = (scores.get(right.orientation) ?? Number.NEGATIVE_INFINITY) -
        (scores.get(left.orientation) ?? Number.NEGATIVE_INFINITY);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return placements.indexOf(left) - placements.indexOf(right);
    })[0];
  }

  private scoreTooltipPlacement(
    primarySpace: number,
    requiredPrimary: number,
    sideA: number,
    sideB: number,
    requiredCross: number
  ): number {
    const primaryOverflow = Math.max(0, requiredPrimary - primarySpace);
    const totalCross = sideA + sideB;
    const crossOverflow = Math.max(0, requiredCross - totalCross);
    const visiblePrimary = Math.min(primarySpace, requiredPrimary);
    const visibleCross = Math.min(totalCross, requiredCross);

    return visiblePrimary + visibleCross - (primaryOverflow * 10 + crossOverflow * 6);
  }
}
