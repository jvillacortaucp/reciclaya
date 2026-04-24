import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ValueRoute } from '../../../models/value-route.model';
import { ValueRouteCardComponent } from '../value-route-card/value-route-card.component';

@Component({
  selector: 'app-value-routes',
  standalone: true,
  imports: [ValueRouteCardComponent],
  templateUrl: './value-routes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRoutesComponent {
  routes = input.required<readonly ValueRoute[]>();
  expandedRouteId = input<string | null>(null);
  selectedRouteId = input<string | null>(null);
  selectedProductId = input<string | null>(null);

  routeSelected = output<string>();
  productSelected = output<{ routeId: string; productId: string }>();

  protected readonly featuredRoute = computed(() => {
    const allRoutes = this.routes();
    const expanded = this.expandedRouteId();
    if (!allRoutes.length) {
      return null;
    }
    if (!expanded) {
      return allRoutes[0];
    }
    return allRoutes.find((route) => route.id === expanded) ?? allRoutes[0];
  });

  protected readonly secondaryRoutes = computed(() => {
    const featuredId = this.featuredRoute()?.id;
    return this.routes()
      .filter((route) => route.id !== featuredId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  onSelectRoute(routeId: string): void {
    this.routeSelected.emit(routeId);
  }

  onSelectProduct(payload: { routeId: string; productId: string }): void {
    this.productSelected.emit(payload);
  }
}
