import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  RecommendationProcess,
  BuyerSegment,
  BuyerScope
} from '../../../models/recommendation.model';
import { PotentialBuyersGridComponent } from '../potential-buyers-grid/potential-buyers-grid.component';

@Component({
  selector: 'app-market-analysis',
  standalone: true,
  imports: [PotentialBuyersGridComponent],
  templateUrl: './market-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketAnalysisComponent {
  recommendation = input<RecommendationProcess | null>(null);
  buyers = input<readonly BuyerSegment[]>([]);
  selectedBuyerSegment = input<BuyerScope>('nacional');

  buyerSegmentChanged = output<BuyerScope>();
}

