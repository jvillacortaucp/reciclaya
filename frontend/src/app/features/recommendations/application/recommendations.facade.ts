import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { Recommendation } from '../../../core/models/app.models';
import { RecommendationsHttpRepository } from '../recommendations-http.repository';
import { RecommendationsService } from '../infrastructure/recommendations.service';
import {
  BuyerSegment,
  BuyerScope,
  ChartType,
  CostView,
  ExplanationStep,
  ManufacturingProcessStep,
  RecommendationProcess,
  RecommendationTab
} from '../models/recommendation.model';

@Injectable()
export class RecommendationsFacade {
  private readonly service = inject(RecommendationsService);
  private readonly recommendationsRepository = inject(RecommendationsHttpRepository);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly recommendation = signal<RecommendationProcess | null>(null);
  readonly commercialRecommendations = signal<readonly Recommendation[]>([]);
  readonly usingCommercialMode = signal(false);
  readonly activeTab = signal<RecommendationTab>('process');
  readonly selectedStepId = signal<string | null>(null);
  readonly selectedExplanationStepId = signal<string | null>(null);
  readonly selectedBuyerSegment = signal<BuyerScope>('nacional');
  readonly selectedCostView = signal<CostView>('percent');
  readonly selectedChartType = signal<ChartType>('donut');

  readonly steps = computed(() => this.recommendation()?.processSteps ?? []);

  readonly selectedStep = computed<ManufacturingProcessStep | null>(() => {
    const allSteps = this.steps();
    const selectedId = this.selectedStepId();
    if (!allSteps.length) return null;
    if (!selectedId) return allSteps[0] ?? null;
    return allSteps.find((step) => step.id === selectedId) ?? allSteps[0] ?? null;
  });

  readonly explanationSteps = computed(() => this.recommendation()?.explanationSteps ?? []);

  readonly selectedExplanationStep = computed<ExplanationStep | null>(() => {
    const allSteps = this.explanationSteps();
    const selectedId = this.selectedExplanationStepId();
    if (!allSteps.length) return null;
    if (!selectedId) return allSteps[0] ?? null;
    return allSteps.find((step) => step.id === selectedId) ?? allSteps[0] ?? null;
  });

  readonly environmentalSummary = computed(() => this.recommendation()?.environmentalSummary ?? null);
  readonly marketData = computed(() => this.recommendation()?.marketAnalysis ?? null);

  readonly filteredBuyers = computed<readonly BuyerSegment[]>(() => {
    const market = this.marketData();
    if (!market) return [];
    return market.potentialBuyers.filter((buyer) => buyer.scope === this.selectedBuyerSegment());
  });

  load(productId?: string | null, tab: RecommendationTab = 'process'): void {
    this.error.set(null);
    this.activeTab.set(tab);
    this.loading.set(true);

    if (!productId) {
      this.usingCommercialMode.set(true);
      this.recommendation.set(null);
      this.recommendationsRepository
        .list()
        .pipe(
          catchError((error: unknown) => {
            this.error.set(getErrorMessage(error, 'No se pudieron cargar las recomendaciones comerciales.'));
            return EMPTY;
          }),
          finalize(() => this.loading.set(false))
        )
        .subscribe((items) => this.commercialRecommendations.set(items));
      return;
    }

    this.usingCommercialMode.set(false);
    this.commercialRecommendations.set([]);
    this.service
      .getProcessRecommendation(productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((process) => {
        this.recommendation.set(process);
        this.selectedStepId.set(process.processSteps[0]?.id ?? null);
        this.selectedExplanationStepId.set(process.explanationSteps[0]?.id ?? null);
      });
  }

  setActiveTab(tab: RecommendationTab): void {
    this.activeTab.set(tab);
  }

  selectStep(stepId: string): void {
    const found = this.steps().some((step) => step.id === stepId);
    if (!found) return;
    this.selectedStepId.set(stepId);
  }

  selectExplanationStep(stepId: string): void {
    const found = this.explanationSteps().some((step) => step.id === stepId);
    if (!found) return;
    this.selectedExplanationStepId.set(stepId);
  }

  setSelectedBuyerSegment(segment: BuyerScope): void {
    this.selectedBuyerSegment.set(segment);
  }

  setSelectedCostView(view: CostView): void {
    this.selectedCostView.set(view);
  }

  setSelectedChartType(type: ChartType): void {
    this.selectedChartType.set(type);
  }
}
