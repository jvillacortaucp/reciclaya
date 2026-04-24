import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideBuilding2, LucideLeaf, LucideStore } from '@lucide/angular';
import { BuyerSegment } from '../../../models/recommendation.model';

interface BuyerFilterOption {
  readonly id: string;
  readonly label: string;
}

const FILTER_OPTIONS: readonly BuyerFilterOption[] = [
  { id: 'all', label: 'Todos' },
  { id: 'enterprise', label: 'Empresas' },
  { id: 'retail', label: 'Retail' },
  { id: 'consumer', label: 'Consumo' }
];

@Component({
  selector: 'app-potential-buyers-grid',
  standalone: true,
  imports: [LucideBuilding2, LucideStore, LucideLeaf],
  templateUrl: './potential-buyers-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PotentialBuyersGridComponent {
  buyers = input<readonly BuyerSegment[]>([]);
  selectedSegment = input<string>('all');

  segmentSelected = output<string>();

  protected readonly filterOptions = FILTER_OPTIONS;

  protected trackByBuyer(_: number, item: BuyerSegment): string {
    return item.id;
  }

  protected isActive(optionId: string): boolean {
    return this.selectedSegment() === optionId;
  }
}

