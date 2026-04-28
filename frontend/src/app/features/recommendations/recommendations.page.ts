import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideBookmark, LucideSparkles } from '@lucide/angular';
import { combineLatest } from 'rxjs';
import { RecommendationsFacade } from './application/recommendations.facade';
import { ManufacturingProcessComponent } from './presentation/components/manufacturing-process/manufacturing-process.component';
import { MarketAnalysisComponent } from './presentation/components/market-analysis/market-analysis.component';
import { RecommendationExplanationComponent } from './presentation/components/recommendation-explanation/recommendation-explanation.component';
import { RecommendationSummaryCardComponent } from './presentation/components/recommendation-summary-card/recommendation-summary-card.component';
import { RecommendationTabsComponent } from './presentation/components/recommendation-tabs/recommendation-tabs.component';
import { RecommendationTab } from './models/recommendation.model';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private loadedProductId: string | null = null;

  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;
  protected readonly recommendation = this.facade.recommendation;
  protected readonly commercialRecommendations = this.facade.commercialRecommendations;
  protected readonly usingCommercialMode = this.facade.usingCommercialMode;
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
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const productId = params.get('productId');
        const tab = this.parseTab(query.get('tab'));

        if (this.loadedProductId !== productId) {
          this.loadedProductId = productId;
          this.facade.load(productId, tab);
          return;
        }

        this.facade.setActiveTab(tab);
      });
  }

  protected setTab(tab: 'process' | 'explanation' | 'market'): void {
    if (this.usingCommercialMode()) {
      return;
    }

    this.facade.setActiveTab(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  protected selectStep(stepId: string): void {
    this.facade.selectStep(stepId);
  }

  protected selectExplanationStep(stepId: string): void {
    this.facade.selectExplanationStep(stepId);
  }

  protected goToExplanation(): void {
    this.setTab('explanation');
  }

  protected goToMarket(): void {
    this.setTab('market');
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

  protected openListing(listingId?: string): void {
    if (!listingId) {
      return;
    }

    void this.router.navigate(['/marketplace', listingId]);
  }

  private parseTab(tab: string | null): RecommendationTab {
    if (tab === 'explanation' || tab === 'market' || tab === 'process') {
      return tab;
    }
    return 'process';
  }
}
