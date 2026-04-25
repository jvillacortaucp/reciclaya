import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideBookmark } from '@lucide/angular';
import { MarketOpportunitySummary } from '../../../models/recommendation.model';

@Component({
  selector: 'app-market-opportunity-summary',
  standalone: true,
  imports: [LucideBookmark],
  templateUrl: './market-opportunity-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketOpportunitySummaryComponent {
  summary = input<MarketOpportunitySummary | null>(null);
}

