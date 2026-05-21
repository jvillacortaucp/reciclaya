import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideArrowLeft, LucideCircleCheck } from '@lucide/angular';
import { ValueSectorProduct, ValueSectorRoute, ValueSectorSelectionSummary } from '../../../models/value-sector.model';

@Component({
  selector: 'app-value-sector-product-detail',
  standalone: true,
  imports: [LucideArrowLeft, LucideCircleCheck],
  templateUrl: './value-sector-product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorProductDetailComponent {
  route = input.required<ValueSectorRoute>();
  product = input.required<ValueSectorProduct>();
  summary = input<ValueSectorSelectionSummary | null>(null);

  backRequested = output<void>();

  protected viabilityScore(): number {
    const selected = this.product();
    if (selected.marketPotential === 'high' && selected.complexity !== 'high') {
      return 85;
    }
    if (selected.marketPotential === 'medium') {
      return 72;
    }
    return 63;
  }

  protected operationCost(): string {
    return this.product().complexity === 'high' ? '$3.8M' : '$1.2M';
  }

  protected projectedRevenue(): string {
    return this.product().marketPotential === 'high' ? '$3.6M' : '$2.1M';
  }
}
