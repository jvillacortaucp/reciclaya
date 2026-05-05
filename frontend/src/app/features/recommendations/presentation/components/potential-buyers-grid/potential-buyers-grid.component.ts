import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideBuilding2, LucideLeaf, LucideStore } from '@lucide/angular';
import { BuyerScope, BuyerSegment } from '../../../models/recommendation.model';

interface BuyerFilterOption {
  readonly id: BuyerScope;
  readonly label: string;
}

const FILTER_OPTIONS: readonly BuyerFilterOption[] = [
  { id: 'nacional', label: 'Nacional' },
  { id: 'internacional', label: 'Internacional' }
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
  selectedSegment = input<BuyerScope>('nacional');

  segmentSelected = output<BuyerScope>();

  protected readonly filterOptions = FILTER_OPTIONS;

  protected readonly visibleBuyers = computed<readonly BuyerSegment[]>(() => {
    const items = this.buyers();
    const segment = this.selectedSegment();
    return items.filter((buyer) => buyer.scope === segment);
  });

  protected trackByBuyer(_: number, item: BuyerSegment): string {
    return item.id;
  }

  protected isActive(optionId: BuyerScope): boolean {
    return this.selectedSegment() === optionId;
  }
}

