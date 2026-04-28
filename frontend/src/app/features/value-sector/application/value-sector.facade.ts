import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ValueSectorHttpRepository } from '../infrastructure/value-sector-http.repository';
import { ValueSectorService } from '../infrastructure/value-sector.service';
import { ValueSectorSelectionSummary, ValueSectorRoute } from '../models/value-sector.model';

const PAGE_SIZE = 4;

@Injectable()
export class ValueSectorFacade {
  private readonly httpRepository = inject(ValueSectorHttpRepository);
  private readonly fallbackService = inject(ValueSectorService);
  private fromListingCache: readonly ValueSectorRoute[] = [];

  readonly items = signal<readonly ValueSectorRoute[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(PAGE_SIZE);
  readonly hasMore = signal(true);
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
    this.listingId.set(listingId);
    this.listingResidueLabel.set(null);
    this.loadError.set(null);
    this.selectedRouteId.set(null);
    this.selectedProductId.set(null);
    this.expandedRouteId.set(null);
    this.page.set(0);
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
    const excludeRouteIds = this.fromListingCache.map((route) => route.id);
    const excludeProductIds = this.fromListingCache.flatMap((route) => route.products.map((product) => product.id));
    this.httpRepository
      .generateFromListing(
        listingId,
        {
          regenerationSeed: Date.now().toString(),
          excludeRouteIds,
          excludeProductIds
        },
        4
      )
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: (response) => {
          console.log('[ValueSector] POST generate response', response);
          this.listingResidueLabel.set(this.resolveResidueLabel(response.listing));
          this.fromListingCache = this.normalizeRoutes(response.routes).slice(0, 4);
          this.items.set([]);
          this.page.set(0);
          this.hasMore.set(this.fromListingCache.length > 0);
          this.appendFromListingPage(1);
          this.loadError.set(null);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            this.fromListingMode.set(false);
            this.loadInitialFallback();
            return;
          }

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
        error: (error: unknown) => this.handleCatalogError(error, false)
      });
  }

  toggleExpandedRoute(routeId: string): void {
    const currentExpanded = this.expandedRouteId();
    if (currentExpanded === routeId) {
      this.expandedRouteId.set(null);
      return;
    }

    const route = this.items().find((item) => item.id === routeId);
    if (!route) {
      return;
    }

    this.expandedRouteId.set(routeId);
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
    this.httpRepository
      .getFromListing(listingId, true)
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: (response) => {
          console.log('[ValueSector] GET from listing response', response);
          this.listingResidueLabel.set(this.resolveResidueLabel(response.listing));
          this.fromListingCache = this.normalizeRoutes(response.routes);
          this.items.set([]);
          this.page.set(0);
          this.hasMore.set(response.routes.length > 0);
          this.appendFromListingPage(1);
          this.loadError.set(null);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            this.fromListingMode.set(false);
            this.loadInitialFallback();
            return;
          }
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

  private handleCatalogError(error: unknown, initial: boolean): void {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      if (initial) {
        this.loadInitialFallback();
      }
      return;
    }

    this.loadError.set(error instanceof Error ? error.message : 'No se pudieron cargar sectores de valor.');
    if (initial) {
      this.items.set([]);
      this.hasMore.set(false);
    }
  }

  private loadInitialFallback(): void {
    this.isInitialLoading.set(true);
    this.fallbackService
      .list({ page: 1, pageSize: this.pageSize() })
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe((response) => {
        this.items.set(response.items);
        this.page.set(response.page);
        this.hasMore.set(response.hasMore);
        this.loadError.set(null);
        this.ensureSelection();
      });
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

  private resolveResidueLabel(listing: { specificResidue?: string; productType?: string } | null | undefined): string | null {
    if (!listing) {
      return null;
    }

    const residue = listing.specificResidue?.trim();
    if (residue) {
      return residue;
    }

    const productType = listing.productType?.trim();
    return productType || null;
  }

  private normalizeRoutes(routes: readonly ValueSectorRoute[]): readonly ValueSectorRoute[] {
    return routes.map((route) => ({
      ...route,
      routeName: route.routeName.replace(/^Sector\s+/i, '').trim()
    }));
  }
}
