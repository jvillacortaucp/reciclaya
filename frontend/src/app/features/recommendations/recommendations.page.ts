import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LucideArrowLeft, LucideBookmark, LucideSparkles } from '@lucide/angular';
import { combineLatest } from 'rxjs';
import { RecommendationsFacade } from './application/recommendations.facade';
import { ChatbotAnalysisRequest } from './recommendations-http.repository';
import { MarketAnalysisComponent } from './presentation/components/market-analysis/market-analysis.component';
import { ManufacturingProcessComponent } from './presentation/components/manufacturing-process/manufacturing-process.component';
import { RecommendationComplexityComponent } from './presentation/components/recommendation-complexity/recommendation-complexity.component';
import { RecommendationTabsComponent } from './presentation/components/recommendation-tabs/recommendation-tabs.component';
import { BuyerScope, RecommendationTab } from './models/recommendation.model';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  providers: [RecommendationsFacade],
  imports: [
    LucideArrowLeft,
    LucideBookmark,
    LucideSparkles,
    RecommendationTabsComponent,
    MarketAnalysisComponent,
    ManufacturingProcessComponent,
    RecommendationComplexityComponent,
  ],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit {
  private readonly facade = inject(RecommendationsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private loadedProductId: string | null = null;
  private readonly sourceListingId = signal<string | null>(null);

  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;
  protected readonly recommendation = this.facade.recommendation;
  protected readonly commercialRecommendations = this.facade.commercialRecommendations;
  protected readonly usingCommercialMode = this.facade.usingCommercialMode;
  protected readonly activeTab = this.facade.activeTab;
  protected readonly explanationData = this.facade.explanationSteps;
  protected readonly selectedStepId = this.facade.selectedStepId;
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
      .subscribe(([params, query]: [ParamMap, ParamMap]) => {
        const productId = params.get('productId');
        const tab = this.parseTab(query.get('tab'));
        this.sourceListingId.set(query.get('listing'));
        const selectedProductId = query.get('selectedProductId') ?? query.get('recommendedProduct');
        const chatbotContext = this.readChatbotContext(params, query);

        if (this.loadedProductId !== productId) {
          this.loadedProductId = productId;
          this.facade.load(productId, tab, this.sourceListingId(), selectedProductId, chatbotContext);
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

  protected selectExplanationStep(stepId: string): void {
    this.facade.selectExplanationStep(stepId);
  }

  protected selectStep(stepId: string): void {
    this.facade.selectStep(stepId);
  }

  protected selectBuyerSegment(segment: BuyerScope): void {
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

  protected goBackToSectorSelection(): void {
    const listingId = this.sourceListingId();

    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigate(['/app/value-sector'], {
      queryParams: {
        listing: listingId ?? undefined
      }
    });
  }

  private parseTab(tab: string | null): RecommendationTab {
    if (tab === 'explanation' || tab === 'market' || tab === 'process') {
      return tab;
    }
    return 'process';
  }

  private readChatbotContext(params: ParamMap, query: ParamMap): ChatbotAnalysisRequest | null {
    const chatbot = query.get('chatbot');
    if (chatbot !== 'true' && chatbot !== '1') {
      return null;
    }

    const productId = params.get('productId');
    const productName = query.get('recommendedProduct');
    if (!productId || !productName) {
      return null;
    }

    return {
      productId,
      productName,
      residueInput: query.get('residueInput') ?? '',
      sectorName: query.get('sectorName') ?? '',
      description: query.get('description'),
      complexity: query.get('complexity'),
      marketPotential: query.get('marketPotential')
    };
  }
}
