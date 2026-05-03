import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ValueSectorHttpRepository } from '../infrastructure/value-sector-http.repository';
import { ValueSectorSelectionSummary, ValueSectorRoute } from '../models/value-sector.model';
import { ValueSectorApiService } from '../services/value-sector-api.service';

interface CachedValueSectorState {
  readonly listingId: string;
  readonly residueName: string | null;
  readonly items: readonly ValueSectorRoute[];
  readonly selectedRouteId: string | null;
  readonly selectedProductId: string | null;
  readonly expandedRouteId: string | null;
  readonly scrollPosition: number;
}

@Injectable({ providedIn: 'root' })
export class ValueSectorFacade {
  private static readonly DEFAULT_PAGE_SIZE = 4;
  private readonly httpRepository = inject(ValueSectorHttpRepository);
  private readonly apiService = inject(ValueSectorApiService);
  private fromListingCache: readonly ValueSectorRoute[] = [];
  private readonly cachedStates = signal<Record<string, CachedValueSectorState>>({});

  readonly items = signal<readonly ValueSectorRoute[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(ValueSectorFacade.DEFAULT_PAGE_SIZE);
  readonly hasMore = signal(false);
  readonly isInitialLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly isGenerating = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly listingId = signal<string | null>(null);
  readonly fromListingMode = signal(false);
  readonly listingResidueLabel = signal<string | null>(null);

  readonly selectedRouteId = signal<string | null>(null);
  readonly selectedProductId = signal<string | null>(null);
  readonly expandedRouteId = signal<string | null>(null);

  readonly selectedRoute = computed(() =>
    this.items().find((route) => route.id === this.selectedRouteId()) ?? null
  );

  readonly selectedProduct = computed(() => {
    const route = this.selectedRoute();
    if (!route) {
      return null;
    }
    return route.products.find((product) => product.id === this.selectedProductId()) ?? null;
  });

  readonly summary = computed<ValueSectorSelectionSummary | null>(() => {
    const route = this.selectedRoute();
    const product = this.selectedProduct();
    if (!route || !product) {
      return null;
    }

    return {
      routeName: route.routeName,
      productName: product.name,
      complexity: product.complexity,
      potential: product.marketPotential,
      targetIndustries: route.targetIndustries,
      insight: route.insight,
      imageUrl: route.heroImageUrl,
      potentialUse: product.potentialUse,
      source: product.source ?? route.source
    };
  });

  readonly completion = computed(() => {
    let total = 0;
    if (this.selectedRoute()) {
      total += 50;
    }
    if (this.selectedProduct()) {
      total += 50;
    }
    return total;
  });

  initialize(listingId: string | null): void {
    const cachedState = listingId ? this.cachedStates()[listingId] : null;
    if (cachedState) {
      this.restoreCachedState(cachedState);
      return;
    }

    this.listingId.set(listingId);
    this.listingResidueLabel.set(null);
    this.loadError.set(null);
    this.selectedRouteId.set(null);
    this.selectedProductId.set(null);
    this.expandedRouteId.set(null);
    this.page.set(0);
    this.pageSize.set(ValueSectorFacade.DEFAULT_PAGE_SIZE);
    this.items.set([]);
    this.hasMore.set(true);

    if (listingId && this.isGuid(listingId)) {
      console.log('[ValueSector] listingId', listingId);
      this.fromListingMode.set(true);
      this.loadFromListing(listingId);
      return;
    }

    this.fromListingMode.set(false);
    this.loadInitialCatalog();
  }

  generateForSelectedListing(): void {
    const listingId = this.listingId();
    if (!listingId || !this.fromListingMode() || this.isGenerating()) {
      return;
    }

    this.loadError.set(null);
    this.isGenerating.set(true);
    this.apiService
      .generateValorizationIdeas(listingId)
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: (response) => {
          this.listingResidueLabel.set(response.listing?.specificResidue?.trim() || null);
          this.fromListingCache = this.normalizeRoutes(response.routes ?? []);
          this.items.set([]);
          this.page.set(0);
          this.hasMore.set(this.fromListingCache.length > 0);
          this.appendFromListingPage(1);
          this.loadError.set(null);
          this.persistCurrentState();
        },
        error: (error: unknown) => {
          this.loadError.set(error instanceof Error ? error.message : 'No se pudieron generar rutas para esta publicación.');
        }
      });
  }

  loadMore(): void {
    if (!this.hasMore() || this.isInitialLoading() || this.isLoadingMore()) {
      return;
    }

    if (this.fromListingMode()) {
      this.isLoadingMore.set(true);
      this.appendFromListingPage(this.page() + 1);
      this.isLoadingMore.set(false);
      return;
    }

    this.isLoadingMore.set(true);
    this.httpRepository
      .getValueSectors({ page: this.page() + 1, pageSize: this.pageSize(), useAi: true })
      .pipe(finalize(() => this.isLoadingMore.set(false)))
      .subscribe({
        next: (response) => this.applyServerPage(response.items, response.page, response.hasMore),
        error: (error: unknown) => this.handleCatalogError(error)
      });
  }

  toggleExpandedRoute(routeId: string): void {
    const currentExpanded = this.expandedRouteId();
    if (currentExpanded === routeId) {
      this.expandedRouteId.set(null);
      this.persistCurrentState();
      return;
    }

    const route = this.items().find((item) => item.id === routeId);
    if (!route) {
      return;
    }

    this.expandedRouteId.set(routeId);
    this.persistCurrentState();
  }

  selectProduct(routeId: string, productId: string): void {
    const route = this.items().find((item) => item.id === routeId);
    if (!route) {
      return;
    }

    const product = route.products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    this.selectedRouteId.set(routeId);
    this.expandedRouteId.set(routeId);
    this.selectedProductId.set(productId);
    this.persistCurrentState();
  }

  rememberScrollPosition(scrollPosition: number): void {
    const listingId = this.listingId();
    if (!listingId) {
      return;
    }

    const current = this.cachedStates()[listingId];
    this.cachedStates.update((state) => ({
      ...state,
      [listingId]: {
        ...(current ?? {
          listingId,
          residueName: this.listingResidueLabel(),
          items: this.fromListingCache.length ? this.fromListingCache : this.items(),
          selectedRouteId: this.selectedRouteId(),
          selectedProductId: this.selectedProductId(),
          expandedRouteId: this.expandedRouteId(),
          scrollPosition: 0
        }),
        listingId,
        residueName: this.listingResidueLabel(),
        items: this.fromListingCache.length ? this.fromListingCache : this.items(),
        selectedRouteId: this.selectedRouteId(),
        selectedProductId: this.selectedProductId(),
        expandedRouteId: this.expandedRouteId(),
        scrollPosition,
      }
    }));
  }

  getRememberedScrollPosition(): number {
    const listingId = this.listingId();
    if (!listingId) {
      return 0;
    }

    return this.cachedStates()[listingId]?.scrollPosition ?? 0;
  }

  hasLoadedListing(listingId: string | null): boolean {
    return !!listingId && !!this.cachedStates()[listingId];
  }

  private loadInitialCatalog(): void {
    this.isInitialLoading.set(true);
    this.httpRepository
      .getValueSectors({ page: 1, pageSize: this.pageSize(), useAi: true })
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: (response) => this.applyServerPage(response.items, response.page, response.hasMore, true),
        error: (error: unknown) => this.handleCatalogError(error, true)
      });
  }

  private loadFromListing(listingId: string): void {
    this.isInitialLoading.set(true);
    this.apiService
      .generateValorizationIdeas(listingId)
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.listingResidueLabel.set(response.listing?.specificResidue?.trim() || null);
          this.fromListingCache = this.normalizeRoutes(response.routes ?? []);
          this.items.set([]);
          this.page.set(0);
          this.hasMore.set(this.fromListingCache.length > 0);
          this.appendFromListingPage(1);
          this.loadError.set(null);
          this.persistCurrentState();
        },
        error: (error: unknown) => {
          this.loadError.set(error instanceof Error ? error.message : 'No se pudieron cargar rutas para esta publicación.');
          this.items.set([]);
          this.hasMore.set(false);
        }
      });
  }

  private appendFromListingPage(page: number): void {
    const pageSize = this.pageSize();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const nextItems = this.fromListingCache.slice(start, end);
    if (!nextItems.length && page > 1) {
      this.hasMore.set(false);
      return;
    }

    this.page.set(page);
    this.items.update((current) => (page === 1 ? nextItems : [...current, ...nextItems]));
    this.hasMore.set(end < this.fromListingCache.length);
    this.ensureSelection();
  }

  private applyServerPage(items: readonly ValueSectorRoute[], page: number, hasMore: boolean, reset = false): void {
    this.page.set(page);
    this.hasMore.set(hasMore);
    this.items.update((current) => (reset ? [...items] : [...current, ...items]));
    this.loadError.set(null);
    this.ensureSelection();
  }

  private handleCatalogError(error: unknown, initial = false): void {
    this.loadError.set(error instanceof Error ? error.message : 'No se pudieron cargar sectores de valor.');
    if (initial) {
      this.items.set([]);
      this.hasMore.set(false);
    }
  }

  private ensureSelection(): void {
    const currentRoute = this.items().find((route) => route.id === this.selectedRouteId());
    if (currentRoute) {
      return;
    }

    const first = this.items()[0];
    if (!first) {
      this.selectedRouteId.set(null);
      this.selectedProductId.set(null);
      this.expandedRouteId.set(null);
      return;
    }

    this.selectedRouteId.set(first.id);
    this.expandedRouteId.set(first.id);
    this.selectedProductId.set(first.products[0]?.id ?? null);
  }

  private isGuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private normalizeRoutes(routes: readonly ValueSectorRoute[]): readonly ValueSectorRoute[] {
    return routes.map((route) => ({
      ...route,
      routeName: route.routeName.replace(/^Sector\s+/i, '').trim()
    }));
  }

  private persistCurrentState(): void {
    const listingId = this.listingId();
    if (!listingId) {
      return;
    }

    const previous = this.cachedStates()[listingId];
    this.cachedStates.update((state) => ({
      ...state,
      [listingId]: {
        listingId,
        residueName: this.listingResidueLabel(),
        items: this.fromListingCache.length ? this.fromListingCache : this.items(),
        selectedRouteId: this.selectedRouteId(),
        selectedProductId: this.selectedProductId(),
        expandedRouteId: this.expandedRouteId(),
        scrollPosition: previous?.scrollPosition ?? 0
      }
    }));
  }

  private restoreCachedState(cachedState: CachedValueSectorState): void {
    this.listingId.set(cachedState.listingId);
    this.fromListingMode.set(true);
    this.listingResidueLabel.set(cachedState.residueName);
    this.loadError.set(null);
    this.selectedRouteId.set(cachedState.selectedRouteId);
    this.selectedProductId.set(cachedState.selectedProductId);
    this.expandedRouteId.set(cachedState.expandedRouteId);
    this.page.set(0);
    this.fromListingCache = cachedState.items;
    this.items.set([]);
    this.hasMore.set(cachedState.items.length > 0);
    this.appendFromListingPage(1);
  }
}
