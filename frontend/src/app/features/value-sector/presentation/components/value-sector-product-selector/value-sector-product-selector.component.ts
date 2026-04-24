import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCheckCircle2 } from '@lucide/angular';
import {
  VALUE_SECTOR_COMPLEXITY_LABEL,
  VALUE_SECTOR_COMPLEXITY_STYLES,
  VALUE_SECTOR_POTENTIAL_LABEL,
  VALUE_SECTOR_POTENTIAL_STYLES
} from '../../../data/value-sector.constants';
import { ValueSectorProduct } from '../../../models/value-sector.model';

@Component({
  selector: 'app-value-sector-product-selector',
  standalone: true,
  imports: [LucideCheckCircle2],
  templateUrl: './value-sector-product-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorProductSelectorComponent {
  products = input.required<readonly ValueSectorProduct[]>();
  selectedProductId = input<string | null>(null);
  productSelected = output<string>();

  protected readonly complexityLabel = VALUE_SECTOR_COMPLEXITY_LABEL;
  protected readonly complexityStyles = VALUE_SECTOR_COMPLEXITY_STYLES;
  protected readonly potentialLabel = VALUE_SECTOR_POTENTIAL_LABEL;
  protected readonly potentialStyles = VALUE_SECTOR_POTENTIAL_STYLES;

  onSelectProduct(productId: string): void {
    this.productSelected.emit(productId);
  }
}
