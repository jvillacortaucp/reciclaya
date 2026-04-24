import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RecommendationProcess, CostView, ChartType, BuyerSegment } from '../../../models/recommendation.model';
import { CompetitionInsightCardComponent } from '../competition-insight-card/competition-insight-card.component';
import { CostProfitAnalysisComponent } from '../cost-profit-analysis/cost-profit-analysis.component';
import { FinishedProductCardComponent } from '../finished-product-card/finished-product-card.component';
import { MarketKpiCardsComponent } from '../market-kpi-cards/market-kpi-cards.component';
import { MarketOpportunitySummaryComponent } from '../market-opportunity-summary/market-opportunity-summary.component';
import { PotentialBuyersGridComponent } from '../potential-buyers-grid/potential-buyers-grid.component';

@Component({
  selector: 'app-market-analysis',
  standalone: true,
  imports: [
    FinishedProductCardComponent,
    MarketKpiCardsComponent,
    PotentialBuyersGridComponent,
    CostProfitAnalysisComponent,
    CompetitionInsightCardComponent,
    MarketOpportunitySummaryComponent
  ],
  templateUrl: './market-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketAnalysisComponent {
  recommendation = input<RecommendationProcess | null>(null);
  buyers = input<readonly BuyerSegment[]>([]);
  selectedBuyerSegment = input<string>('all');
  selectedCostView = input<CostView>('percent');
  selectedChartType = input<ChartType>('donut');

  buyerSegmentChanged = output<string>();
  costViewChanged = output<CostView>();
  chartTypeChanged = output<ChartType>();
}

