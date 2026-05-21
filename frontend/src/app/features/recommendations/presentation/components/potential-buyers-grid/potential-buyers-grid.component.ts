import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideBuilding2, LucideLeaf, LucideStore } from '@lucide/angular';
import { PotentialBuyersMapComponent } from 'app/shared/components/potential-buyers-map/potential-buyers-map.component';
import { PotentialBuyer } from 'app/shared/components/potential-buyers-map/potential-buyers-map.models';
import { BuyerScope, BuyerSegment } from '../../../models/recommendation.model';
import { adaptBuyerSegmentsToPotentialBuyers } from '../../../data/potential-buyer-map.adapter';

@Component({
  selector: 'app-potential-buyers-grid',
  standalone: true,
  imports: [LucideBuilding2, LucideStore, LucideLeaf, PotentialBuyersMapComponent],
  templateUrl: './potential-buyers-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PotentialBuyersGridComponent {
  buyers = input<readonly BuyerSegment[]>([]);
  selectedSegment = input<BuyerScope>('nacional');

  segmentSelected = output<BuyerScope>();
  buyerSelected = output<BuyerSegment>();

  protected readonly visibleBuyers = computed<readonly BuyerSegment[]>(() => {
    const items = this.buyers();
    const segment = this.selectedSegment();
    return items.filter((buyer) => buyer.scope === segment);
  });
  protected readonly allMapBuyers = computed<readonly PotentialBuyer[]>(() =>
    adaptBuyerSegmentsToPotentialBuyers(this.buyers())
  );
  protected readonly mapScope = computed(() =>
    this.selectedSegment() === 'nacional' ? 'national' : 'international'
  );

  protected trackByBuyer(_: number, item: BuyerSegment): string {
    return item.id;
  }

  protected handleBuyerSelected(selectedBuyer: PotentialBuyer): void {
    const current = this.visibleBuyers().find((buyer) => buyer.id === selectedBuyer.id);
    if (current) {
      this.buyerSelected.emit(current);
    }
  }

  protected handleScopeChanged(scope: 'national' | 'international'): void {
    this.segmentSelected.emit(scope === 'national' ? 'nacional' : 'internacional');
  }
}

