import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideArrowRight,
  LucideMicroscope,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideUtensils,
  LucideZap
} from '@lucide/angular';
import { VALUE_ROUTE_POTENTIAL_LABEL } from '../../../data/value-route.constants';
import { ValueRoute } from '../../../models/value-route.model';
import { ValueRouteComplexityBadgeComponent } from '../value-route-complexity-badge/value-route-complexity-badge.component';
import { ValueRouteProductsComponent } from '../value-route-products/value-route-products.component';

@Component({
  selector: 'app-value-route-card',
  standalone: true,
  imports: [
    LucideUtensils,
    LucideSparkles,
    LucidePill,
    LucideMicroscope,
    LucideZap,
    LucidePackage,
    LucideArrowRight,
    ValueRouteComplexityBadgeComponent,
    ValueRouteProductsComponent
  ],
  templateUrl: './value-route-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRouteCardComponent {
  route = input.required<ValueRoute>();
  expanded = input<boolean>(false);
  selected = input<boolean>(false);
  selectedProductId = input<string | null>(null);

  routeSelected = output<string>();
  productSelected = output<{ routeId: string; productId: string }>();

  protected readonly potentialLabel = VALUE_ROUTE_POTENTIAL_LABEL;

  onSelectRoute(): void {
    this.routeSelected.emit(this.route().id);
  }

  onSelectProduct(productId: string): void {
    this.productSelected.emit({ routeId: this.route().id, productId });
  }
}
