import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ValueSectorService } from '../infrastructure/value-sector.service';
import { ValueSectorSelectionSummary, ValueSectorRoute } from '../models/value-sector.model';

const PAGE_SIZE = 4;

@Injectable()
export class ValueSectorFacade {
  private readonly service = inject(ValueSectorService);

  readonly items = signal<readonly ValueSectorRoute[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(PAGE_SIZE);
  readonly hasMore = signal(true);
  readonly isInitialLoading = signal(false);
  readonly isLoadingMore = signal(false);

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
    this.items.set([]);
    this.page.set(0);
    this.hasMore.set(true);
    this.selectedRouteId.set(null);
    this.selectedProductId.set(null);
    this.expandedRouteId.set(null);
    this.isInitialLoading.set(true);
    this.loadPage(1, true);
  }

  loadMore(): void {
    if (!this.hasMore() || this.isInitialLoading() || this.isLoadingMore()) {
      return;
    }
    this.isLoadingMore.set(true);
    this.loadPage(this.page() + 1, false);
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

  private loadPage(page: number, isInitial: boolean): void {
    this.service
      .list({ page, pageSize: this.pageSize() })
      .pipe(
        finalize(() => {
          if (isInitial) {
            this.isInitialLoading.set(false);
          } else {
            this.isLoadingMore.set(false);
          }
        })
      )
      .subscribe((response) => {
        this.page.set(response.page);
        this.hasMore.set(response.hasMore);
        this.items.update((current) => [...current, ...response.items]);
      });
  }
}
