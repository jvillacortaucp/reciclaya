import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CostStructureItem, CostView, ChartType } from '../../../models/recommendation.model';
import { MarketChartCardComponent } from '../market-chart-card/market-chart-card.component';

@Component({
  selector: 'app-cost-profit-analysis',
  standalone: true,
  imports: [DecimalPipe, MarketChartCardComponent],
  templateUrl: './cost-profit-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostProfitAnalysisComponent {
  costStructure = input<readonly CostStructureItem[]>([]);
  grossMarginPercent = input<number>(0);
  suggestedPricePerKg = input<number>(0);
  totalCostPerKg = input<number>(0);
  chartLabels = input<readonly string[]>([]);
  chartSeries = input<readonly number[]>([]);
  selectedCostView = input<CostView>('percent');
  selectedChartType = input<ChartType>('donut');

  costViewChanged = output<CostView>();
  chartTypeChanged = output<ChartType>();

  protected trackByCost(_: number, item: CostStructureItem): string {
    return item.id;
  }
}
