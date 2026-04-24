import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideBeaker,
  LucideCheckCircle2,
  LucideCookie,
  LucideDroplets,
  LucideFactory,
  LucideLeaf,
  LucideMicroscope,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideZap
} from '@lucide/angular';
import {
  VALUE_ROUTE_COMPLEXITY_LABEL,
  VALUE_ROUTE_COMPLEXITY_STYLES,
  VALUE_ROUTE_POTENTIAL_LABEL,
  VALUE_ROUTE_POTENTIAL_STYLES
} from '../../../data/value-route.constants';
import { ValueRouteProduct } from '../../../models/value-route.model';

@Component({
  selector: 'app-value-route-products',
  standalone: true,
  imports: [
    LucideLeaf,
    LucideCheckCircle2,
    LucideCookie,
    LucideSparkles,
    LucideDroplets,
    LucidePill,
    LucideMicroscope,
    LucideZap,
    LucidePackage,
    LucideBeaker,
    LucideFactory
  ],
  templateUrl: './value-route-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRouteProductsComponent {
  products = input.required<readonly ValueRouteProduct[]>();
  selectedProductId = input<string | null>(null);
  productSelected = output<string>();

  protected readonly complexityLabel = VALUE_ROUTE_COMPLEXITY_LABEL;
  protected readonly complexityStyles = VALUE_ROUTE_COMPLEXITY_STYLES;
  protected readonly potentialLabel = VALUE_ROUTE_POTENTIAL_LABEL;
  protected readonly potentialStyles = VALUE_ROUTE_POTENTIAL_STYLES;

  onSelectProduct(productId: string): void {
    this.productSelected.emit(productId);
  }
}
