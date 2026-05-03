import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MarketOpportunitySummary } from '../../../models/recommendation.model';

@Component({
  selector: 'app-market-opportunity-summary',
  standalone: true,
  templateUrl: './market-opportunity-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketOpportunitySummaryComponent {
  summary = input<MarketOpportunitySummary | null>(null);
}

