import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { mapValorizationResponseToValueSectors } from '../mappers/value-sector.mapper';
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
  private readonly service = inject(ValueSectorApiService);
  private readonly cache = signal<Record<string, CachedValueSectorState>>({});

  readonly items = signal<readonly ValueSectorRoute[]>([]);
  readonly page = signal(1);
  readonly pageSize = signal(0);
  readonly hasMore = signal(false);
  readonly isInitialLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly residueName = signal<string | null>(null);
  readonly listingId = signal<string | null>(null);

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
      potentialUse: product.potentialUse
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

  loadInitial(): void {
    this.resetState();
  }

  loadForListing(listingId: string): void {
    if (this.listingId() === listingId && this.items().length > 0) {
      return;
    }

    const cachedState = this.cache()[listingId];
    if (cachedState) {
      this.applyCachedState(cachedState);
      return;
    }

    this.resetState();
    this.listingId.set(listingId);
    this.items.set([]);
    this.isInitialLoading.set(true);
    this.service
      .generateValorizationIdeas(listingId)
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.residueName.set(response.residueName?.trim() || null);
          this.items.set(mapValorizationResponseToValueSectors(response));
          this.page.set(1);
          this.pageSize.set(response.ideas.length);
          this.hasMore.set(false);
          this.persistCurrentState();
        },
        error: (error: Error) => {
          this.error.set(error.message || 'No se pudieron generar las rutas de valor para este residuo.');
          this.items.set([]);
        }
      });
  }

  retry(): void {
    const currentListingId = this.listingId();
    if (!currentListingId) {
      return;
    }

    this.loadForListing(currentListingId);
  }

  resetForMissingListing(): void {
    this.resetState();
  }

  loadMore(): void {
    return;
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

    const currentState = this.cache()[listingId];
    this.cache.update((cache) => ({
      ...cache,
      [listingId]: {
        ...(currentState ?? {
          listingId,
          residueName: this.residueName(),
          items: this.items(),
          selectedRouteId: this.selectedRouteId(),
          selectedProductId: this.selectedProductId(),
          expandedRouteId: this.expandedRouteId(),
          scrollPosition: 0
        }),
        listingId,
        residueName: this.residueName(),
        items: this.items(),
        selectedRouteId: this.selectedRouteId(),
        selectedProductId: this.selectedProductId(),
        expandedRouteId: this.expandedRouteId(),
        scrollPosition
      }
    }));
  }

  getRememberedScrollPosition(listingId: string | null): number {
    if (!listingId) {
      return 0;
    }

    return this.cache()[listingId]?.scrollPosition ?? 0;
  }

  hasCachedListing(listingId: string | null): boolean {
    if (!listingId) {
      return false;
    }

    return !!this.cache()[listingId];
  }

  private resetState(): void {
    this.page.set(1);
    this.pageSize.set(0);
    this.hasMore.set(false);
    this.isInitialLoading.set(false);
    this.isLoadingMore.set(false);
    this.error.set(null);
    this.residueName.set(null);
    this.listingId.set(null);
    this.selectedRouteId.set(null);
    this.selectedProductId.set(null);
    this.expandedRouteId.set(null);
  }

  private persistCurrentState(): void {
    const listingId = this.listingId();
    if (!listingId) {
      return;
    }

    const currentState = this.cache()[listingId];
    this.cache.update((cache) => ({
      ...cache,
      [listingId]: {
        listingId,
        residueName: this.residueName(),
        items: this.items(),
        selectedRouteId: this.selectedRouteId(),
        selectedProductId: this.selectedProductId(),
        expandedRouteId: this.expandedRouteId(),
        scrollPosition: currentState?.scrollPosition ?? 0
      }
    }));
  }

  private applyCachedState(cachedState: CachedValueSectorState): void {
    this.resetState();
    this.listingId.set(cachedState.listingId);
    this.residueName.set(cachedState.residueName);
    this.items.set(cachedState.items);
    this.selectedRouteId.set(cachedState.selectedRouteId);
    this.selectedProductId.set(cachedState.selectedProductId);
    this.expandedRouteId.set(cachedState.expandedRouteId);
    this.page.set(1);
    this.pageSize.set(cachedState.items.length);
    this.hasMore.set(false);
  }
}
