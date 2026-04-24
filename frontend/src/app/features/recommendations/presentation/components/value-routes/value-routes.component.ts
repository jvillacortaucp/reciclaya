import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  routeToggled = output<string>();
  productSelected = output<{ routeId: string; productId: string }>();

  onToggleRoute(routeId: string): void {
    this.routeToggled.emit(routeId);
  }

  onSelectProduct(payload: { routeId: string; productId: string }): void {
    this.productSelected.emit(payload);
  }
}
