import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { Recommendation, RecommendationDetail } from '../../../core/models/app.models';
import { RecommendationsHttpRepository } from '../recommendations-http.repository';
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
  private readonly recommendationsRepository = inject(RecommendationsHttpRepository);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly recommendation = signal<RecommendationProcess | null>(null);
  readonly commercialRecommendations = signal<readonly Recommendation[]>([]);
  readonly usingCommercialMode = signal(false);
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

  load(productOrListingId?: string | null, tab: RecommendationTab = 'process'): void {
    this.error.set(null);
    this.activeTab.set(tab);
    this.loading.set(true);

    if (!productOrListingId) {
      this.usingCommercialMode.set(true);
      this.recommendation.set(null);
      this.recommendationsRepository
        .list(5, true, true)
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

    if (!this.isGuid(productOrListingId)) {
      this.recommendationsRepository
        .getIndustrialProductDetail(productOrListingId)
        .pipe(
          catchError((error: unknown) => {
            this.error.set(getErrorMessage(error, 'No se pudo cargar el detalle industrial.'));
            return EMPTY;
          }),
          finalize(() => this.loading.set(false))
        )
        .subscribe((process) => {
          this.recommendation.set(process);
          this.selectedStepId.set(process.processSteps[0]?.id ?? null);
          this.selectedExplanationStepId.set(process.explanationSteps[0]?.id ?? null);
        });
      return;
    }

    this.recommendationsRepository
      .getListingAnalysis(productOrListingId, true, true)
      .pipe(
        catchError((error: unknown) => {
          this.error.set(getErrorMessage(error, 'No se pudo cargar el detalle de recomendacion.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((detail) => {
        const process = this.toRecommendationProcess(detail);
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

  private toRecommendationProcess(detail: RecommendationDetail): RecommendationProcess {
    const complexity = detail.viabilityLevel === 'high' ? 'low' : detail.viabilityLevel === 'low' ? 'high' : 'medium';
    const potential = detail.viabilityLevel === 'high' ? 'high' : detail.viabilityLevel === 'low' ? 'low' : 'medium';
    const primaryProduct = detail.potentialProducts[0] ?? detail.listingTitle;
    const risks = detail.risks.length ? detail.risks : ['Validar calidad y trazabilidad del material.'];
    const required = detail.requiredConditions.length ? detail.requiredConditions : ['Solicitar ficha tecnica y disponibilidad.'];

    return {
      recommendationId: `rec-${detail.listingId}`,
      recommendedProduct: primaryProduct,
      baseResidue: detail.listingTitle,
      complexity,
      totalEstimatedTime: '48-72 horas para evaluacion comercial',
      approximateCost: 'Depende de precio y logistica acordada',
      marketPotential: potential,
      principalEquipment: ['Validacion tecnica', 'Logistica de recepcion', 'Control de calidad'],
      expectedOutcome: detail.buyerBenefit,
      explanation: detail.aiExplanation,
      processSteps: [
        {
          id: 'proc-1',
          order: 1,
          title: 'Validar condiciones del listing',
          shortDescription: required[0],
          estimatedTime: '1 dia',
          requiredEquipment: ['Ficha tecnica', 'Contacto con seller'],
          keyActions: [required[0], required[Math.min(1, required.length - 1)] ?? required[0]],
          quickTip: detail.suggestedAction,
          riskLevel: detail.viabilityLevel === 'low' ? 'high' : 'medium',
          iconName: 'package-search'
        },
        {
          id: 'proc-2',
          order: 2,
          title: 'Definir uso recomendado',
          shortDescription: detail.recommendedUse,
          estimatedTime: '1-2 dias',
          requiredEquipment: ['Evaluacion interna'],
          keyActions: [detail.recommendedUse, detail.nextStep],
          quickTip: 'Alinea la compra con tu capacidad operativa actual.',
          riskLevel: 'medium',
          iconName: 'factory'
        },
        {
          id: 'proc-3',
          order: 3,
          title: 'Ejecutar siguiente paso comercial',
          shortDescription: detail.nextStep,
          estimatedTime: '1 dia',
          requiredEquipment: ['Canal comercial'],
          keyActions: [detail.suggestedAction, detail.nextStep],
          quickTip: 'Registra acuerdos de precio y entrega por escrito.',
          riskLevel: 'low',
          iconName: 'package'
        }
      ],
      explanationSteps: [
        {
          id: 'exp-1',
          order: 1,
          title: 'Justificacion comercial',
          shortLabel: 'Justificacion',
          transformationType: 'Analisis IA',
          whatHappens: detail.aiExplanation,
          whyItMatters: detail.buyerBenefit,
          transformationOutcome: detail.recommendedUse,
          quickTip: detail.suggestedAction,
          avoidRisk: risks[0],
          processImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1280&q=80',
          environmentalFactors: {
            positive: ['Aprovecha residuos disponibles en el mercado circular.'],
            negative: risks
          },
          natureBenefits: ['Economia circular', 'Mejor uso de residuos', 'Reduccion de merma'],
          iconName: 'scan-line'
        }
      ],
      environmentalSummary: {
        impactScore: detail.confidenceScore / 10,
        utilizationLevelLabel: detail.viabilityLevel === 'high' ? 'Alto' : detail.viabilityLevel === 'low' ? 'Bajo' : 'Medio',
        utilizationPercent: detail.confidenceScore,
        environmentalRiskLabel: detail.viabilityLevel === 'low' ? 'Alto' : 'Controlado',
        environmentalRiskPercent: detail.viabilityLevel === 'low' ? 65 : 28,
        keyRecommendation: detail.nextStep
      },
      marketAnalysis: {
        finishedProduct: {
          name: primaryProduct,
          useCase: detail.recommendedUse,
          suggestedFormat: 'Compra por lote validado',
          suggestedPricePerKg: 0,
          opportunityTag: detail.viabilityLevel === 'high' ? 'Opportunity: High' : 'Opportunity: Medium',
          productImageUrl: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?auto=format&fit=crop&w=1280&q=80'
        },
        potentialBuyers: [
          {
            id: 'buyer-1',
            name: 'Segmento industrial',
            segment: 'B2B',
            monthlyVolume: 'Segun disponibilidad',
            probability: detail.confidenceScore,
            channel: 'Directo',
            type: 'enterprise',
            iconName: 'building'
          }
        ],
        marketKpis: [
          {
            id: 'kpi-1',
            label: 'Confianza IA',
            value: `${detail.confidenceScore}%`,
            helper: `Fuente: ${detail.source}`,
            trendPercent: detail.confidenceScore - 50,
            tone: detail.confidenceScore >= 70 ? 'emerald' : 'amber'
          }
        ],
        costStructure: [
          { id: 'cost-1', label: 'Materia prima', amountUsd: 45, percent: 45 },
          { id: 'cost-2', label: 'Logistica', amountUsd: 30, percent: 30 },
          { id: 'cost-3', label: 'Validacion', amountUsd: 25, percent: 25 }
        ],
        estimatedGrossMarginPercent: Math.max(15, detail.confidenceScore - 20),
        suggestedPricePerKg: 0,
        totalCostPerKg: 0,
        competitionInsight: {
          competitionLevelLabel: detail.viabilityLevel === 'high' ? 'Media' : 'Alta',
          directSubstitutes: detail.potentialProducts.slice(0, 3),
          positioningRecommendation: detail.suggestedAction
        },
        opportunitySummary: {
          generatedAt: new Date().toISOString().slice(0, 10),
          initialInvestment: 'Validar segun cotizacion',
          paybackPeriod: 'Depende de volumen negociado',
          monthlyProfitability: detail.buyerBenefit,
          sustainabilityScore: `${Math.max(40, detail.confidenceScore)}/100`,
          nextSteps: [detail.nextStep],
          ecoTip: risks[0]
        },
        chartLabels: ['Confianza', 'Viabilidad'],
        chartSeries: [detail.confidenceScore, detail.viabilityLevel === 'high' ? 85 : detail.viabilityLevel === 'low' ? 45 : 65]
      }
    };
  }

  private isGuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

}
