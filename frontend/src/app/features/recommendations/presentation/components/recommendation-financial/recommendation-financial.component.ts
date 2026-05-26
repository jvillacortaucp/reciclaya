import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChartType, CostView, RecommendationProcess } from '../../../models/recommendation.model';
import { CompetitionInsightCardComponent } from '../competition-insight-card/competition-insight-card.component';
import { CostProfitAnalysisComponent } from '../cost-profit-analysis/cost-profit-analysis.component';
import { FinishedProductCardComponent } from '../finished-product-card/finished-product-card.component';
import { MarketKpiCardsComponent } from '../market-kpi-cards/market-kpi-cards.component';
import { MarketOpportunitySummaryComponent } from '../market-opportunity-summary/market-opportunity-summary.component';

@Component({
  selector: 'app-recommendation-financial',
  standalone: true,
  imports: [
    FinishedProductCardComponent,
    MarketKpiCardsComponent,
    CostProfitAnalysisComponent,
    CompetitionInsightCardComponent,
    MarketOpportunitySummaryComponent
  ],
  templateUrl: './recommendation-financial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationFinancialComponent {
  recommendation = input<RecommendationProcess | null>(null);
  selectedCostView = input<CostView>('percent');
  selectedChartType = input<ChartType>('donut');

  costViewChanged = output<CostView>();
  chartTypeChanged = output<ChartType>();
}
