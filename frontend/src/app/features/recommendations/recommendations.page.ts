import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LucideBookmark, LucideSparkles } from '@lucide/angular';
import { RecommendationsFacade } from './application/recommendations.facade';
import { ManufacturingProcessComponent } from './presentation/components/manufacturing-process/manufacturing-process.component';
import { MarketAnalysisComponent } from './presentation/components/market-analysis/market-analysis.component';
import { RecommendationExplanationComponent } from './presentation/components/recommendation-explanation/recommendation-explanation.component';
import { RecommendationSummaryCardComponent } from './presentation/components/recommendation-summary-card/recommendation-summary-card.component';
import { RecommendationTabsComponent } from './presentation/components/recommendation-tabs/recommendation-tabs.component';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  providers: [RecommendationsFacade],
  imports: [
    LucideBookmark,
    LucideSparkles,
    RecommendationTabsComponent,
    ManufacturingProcessComponent,
    MarketAnalysisComponent,
    RecommendationExplanationComponent,
    RecommendationSummaryCardComponent
  ],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit {
  private readonly facade = inject(RecommendationsFacade);

  protected readonly loading = this.facade.loading;
  protected readonly recommendation = this.facade.recommendation;
  protected readonly activeTab = this.facade.activeTab;
  protected readonly selectedStepId = this.facade.selectedStepId;
  protected readonly selectedStep = this.facade.selectedStep;
  protected readonly explanationData = this.facade.explanationSteps;
  protected readonly selectedExplanationStepId = this.facade.selectedExplanationStepId;
  protected readonly selectedExplanationStep = this.facade.selectedExplanationStep;
  protected readonly environmentalSummary = this.facade.environmentalSummary;
  protected readonly filteredBuyers = this.facade.filteredBuyers;
  protected readonly selectedBuyerSegment = this.facade.selectedBuyerSegment;
  protected readonly selectedCostView = this.facade.selectedCostView;
  protected readonly selectedChartType = this.facade.selectedChartType;

  ngOnInit(): void {
    this.facade.load();
  }

  protected setTab(tab: 'process' | 'explanation' | 'market'): void {
    this.facade.setActiveTab(tab);
  }

  protected selectStep(stepId: string): void {
    this.facade.selectStep(stepId);
  }

  protected selectExplanationStep(stepId: string): void {
    this.facade.selectExplanationStep(stepId);
  }

  protected goToExplanation(): void {
    this.facade.setActiveTab('explanation');
  }

  protected goToMarket(): void {
    this.facade.setActiveTab('market');
  }

  protected selectBuyerSegment(segment: string): void {
    this.facade.setSelectedBuyerSegment(segment);
  }

  protected selectCostView(view: 'percent' | 'usd'): void {
    this.facade.setSelectedCostView(view);
  }

  protected selectChartType(type: 'donut' | 'bar'): void {
    this.facade.setSelectedChartType(type);
  }
}
