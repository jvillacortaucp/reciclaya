import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { RecommendationsService } from '../infrastructure/recommendations.service';
import {
  BuyerSegment,
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

  readonly loading = signal(false);
  readonly recommendation = signal<RecommendationProcess | null>(null);
  readonly activeTab = signal<RecommendationTab>('process');
  readonly selectedStepId = signal<string | null>(null);
  readonly selectedExplanationStepId = signal<string | null>(null);
  readonly selectedBuyerSegment = signal<string>('all');
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
    const selectedSegment = this.selectedBuyerSegment();
    if (selectedSegment === 'all') return market.potentialBuyers;
    return market.potentialBuyers.filter((buyer) => buyer.type === selectedSegment);
  });

  load(productId?: string | null, tab: RecommendationTab = 'process'): void {
    this.activeTab.set(tab);
    this.loading.set(true);
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

  setSelectedBuyerSegment(segment: string): void {
    this.selectedBuyerSegment.set(segment);
  }

  setSelectedCostView(view: CostView): void {
    this.selectedCostView.set(view);
  }

  setSelectedChartType(type: ChartType): void {
    this.selectedChartType.set(type);
  }
}
