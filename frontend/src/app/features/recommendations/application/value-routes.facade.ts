import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ValueRoutesMockRepository } from '../infrastructure/value-routes.mock.repository';
import { ValueRoute, ValueRouteSelectionSummary } from '../models/value-route.model';

@Injectable()
export class ValueRoutesFacade {
  private readonly repository = inject(ValueRoutesMockRepository);

  readonly loading = signal(false);
  readonly routes = signal<readonly ValueRoute[]>([]);
  readonly selectedRouteId = signal<string | null>(null);
  readonly selectedProductId = signal<string | null>(null);
  readonly expandedRouteId = signal<string | null>(null);

  readonly selectedRoute = computed(() =>
    this.routes().find((route) => route.id === this.selectedRouteId()) ?? null
  );

  readonly selectedProduct = computed(() => {
    const currentRoute = this.selectedRoute();
    if (!currentRoute) {
      return null;
    }

    return currentRoute.products.find((product) => product.id === this.selectedProductId()) ?? null;
  });

  readonly summary = computed<ValueRouteSelectionSummary | null>(() => {
    const route = this.selectedRoute();
    const product = this.selectedProduct();
    if (!route || !product) {
      return null;
    }

    return {
      routeName: route.name,
      productName: product.name,
      complexity: route.complexity,
      potential: route.potential,
      targetIndustries: route.targetIndustries,
      insight: route.valueInsight,
      imageUrl: route.heroImageUrl
    };
  });

  readonly completion = computed(() => {
    let value = 0;
    if (this.selectedRoute()) {
      value += 50;
    }
    if (this.selectedProduct()) {
      value += 50;
    }
    return value;
  });

  loadRoutes(): void {
    this.loading.set(true);
    this.repository
      .listByResidue()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((routes) => {
        this.routes.set(routes);
        const firstRoute = routes[0];
        if (!firstRoute) {
          this.selectedRouteId.set(null);
          this.selectedProductId.set(null);
          this.expandedRouteId.set(null);
          return;
        }

        this.selectedRouteId.set(firstRoute.id);
        this.expandedRouteId.set(firstRoute.id);
        this.selectedProductId.set(firstRoute.products[0]?.id ?? null);
      });
  }

  selectRoute(routeId: string): void {
    const route = this.routes().find((item) => item.id === routeId);
    if (!route) {
      return;
    }

    this.selectedRouteId.set(route.id);
    this.expandedRouteId.set(route.id);
    this.selectedProductId.set(route.products[0]?.id ?? null);
  }

  selectProduct(routeId: string, productId: string): void {
    const route = this.routes().find((item) => item.id === routeId);
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
}
