import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideDroplets,
  LucideFlame,
  LucideFlaskConical,
  LucideHammer,
  LucideMicroscope,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideSprout,
  LucideStore,
  LucideUtensils
} from '@lucide/angular';
import { VALUE_ROUTE_POTENTIAL_LABEL } from '../../../data/value-route.constants';
import { ValueRoute } from '../../../models/value-route.model';
import { ValueRouteProductsComponent } from '../value-route-products/value-route-products.component';

@Component({
  selector: 'app-value-route-card',
  standalone: true,
  imports: [
    NgClass,
    LucideUtensils,
    LucideSparkles,
    LucidePill,
    LucideSprout,
    LucideFlame,
    LucideMicroscope,
    LucideFlaskConical,
    LucideDroplets,
    LucideHammer,
    LucidePackage,
    LucideStore,
    LucideChevronDown,
    LucideChevronUp,
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

  routeToggled = output<string>();
  productSelected = output<{ routeId: string; productId: string }>();

  protected readonly potentialLabel = VALUE_ROUTE_POTENTIAL_LABEL;

  onToggleRoute(): void {
    this.routeToggled.emit(this.route().id);
  }

  onSelectProduct(productId: string): void {
    this.productSelected.emit({ routeId: this.route().id, productId });
  }
}
