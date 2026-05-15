import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideArrowLeft, LucideBadgeCheck } from '@lucide/angular';
import { ValueSectorProduct, ValueSectorRoute } from '../../../models/value-sector.model';

@Component({
  selector: 'app-value-sector-product-options',
  standalone: true,
  imports: [LucideArrowLeft, LucideBadgeCheck],
  templateUrl: './value-sector-product-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorProductOptionsComponent {
  route = input.required<ValueSectorRoute>();
  selectedProductId = input<string | null>(null);

  backRequested = output<void>();
  productSelected = output<string>();

  protected phaseLabel(product: ValueSectorProduct): string {
    return product.marketPotential === 'high' ? 'READY TO MARKET' : 'RED PHASE';
  }

  protected yieldLabel(product: ValueSectorProduct): string {
    switch (product.complexity) {
      case 'low':
        return '42%';
      case 'medium':
        return '28%';
      default:
        return '19%';
    }
  }

  protected estimatedPrice(product: ValueSectorProduct): string {
    switch (product.marketPotential) {
      case 'high':
        return '$2.40/kg';
      case 'medium':
        return 'Est. $4.10/u';
      default:
        return 'Est. $1.75/kg';
    }
  }
}
