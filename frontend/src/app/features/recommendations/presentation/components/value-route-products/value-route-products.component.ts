import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideBeaker,
  LucideCheckCircle2,
  LucideCookie,
  LucideDroplets,
  LucideLeaf,
  LucideMicroscope,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideZap
} from '@lucide/angular';
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
    LucideBeaker
  ],
  templateUrl: './value-route-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRouteProductsComponent {
  products = input.required<readonly ValueRouteProduct[]>();
  selectedProductId = input<string | null>(null);
  productSelected = output<string>();

  onSelectProduct(productId: string): void {
    this.productSelected.emit(productId);
  }
}
