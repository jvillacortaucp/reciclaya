import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse, Recommendation } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { BuyerSegment, RecommendationProcess } from './models/recommendation.model';

interface ValueRouteDetailApi {
  readonly recommendationId: string;
  readonly recommendedProduct: string;
  readonly baseResidue: string;
  readonly complexity: string;
  readonly totalEstimatedTime: string;
  readonly approximateCost: string;
  readonly marketPotential: string;
  readonly principalEquipment: readonly string[];
  readonly expectedOutcome: string;
  readonly explanation: string;
  readonly manufacturingProcess?: string | null;
  readonly complexityOverview?: {
    readonly processingRequired?: string | null;
    readonly equipmentNeeded?: string | null;
    readonly technicalKnowledge?: string | null;
    readonly transformationTime?: string | null;
    readonly estimatedCost?: string | null;
    readonly operationalRisk?: string | null;
    readonly positiveEnvironmentalImpact?: string | null;
  } | null;
  readonly source?: string | null;
  readonly explanationSteps: readonly {
    readonly id: string;
    readonly order: number;
    readonly title: string;
    readonly shortLabel: string;
    readonly transformationType: string;
    readonly whatHappens: string;
    readonly whyItMatters: string;
    readonly transformationOutcome: string;
    readonly quickTip: string;
    readonly avoidRisk: string;
    readonly processImageUrl: string;
    readonly environmentalFactors: {
      readonly positive: readonly string[];
      readonly negative: readonly string[];
    };
    readonly natureBenefits: readonly string[];
    readonly iconName: string;
  }[];
  readonly environmentalSummary: {
    readonly impactScore: number;
    readonly utilizationLevelLabel: string;
    readonly utilizationPercent: number;
    readonly environmentalRiskLabel: string;
    readonly environmentalRiskPercent: number;
    readonly keyRecommendation: string;
  };
  readonly marketAnalysis: {
    readonly finishedProduct: {
      readonly name: string;
      readonly useCase: string;
      readonly suggestedFormat: string;
      readonly suggestedPricePerKg: number;
      readonly opportunityTag: string;
      readonly productImageUrl: string;
    };
    readonly potentialBuyers: readonly {
      readonly id: string;
      readonly name: string;
      readonly segment: string;
      readonly monthlyVolume: string;
      readonly probability: number;
      readonly channel: string;
      readonly type: string;
      readonly marketScope?: string;
      readonly region?: string;
      readonly country?: string;
      readonly iconName: string;
    }[];
    readonly marketKpis: readonly {
      readonly id: string;
      readonly label: string;
      readonly value: string;
      readonly helper: string;
      readonly trendPercent: number;
      readonly tone: string;
    }[];
    readonly costStructure: readonly {
      readonly id: string;
      readonly label: string;
      readonly amountUsd: number;
      readonly percent: number;
    }[];
    readonly estimatedGrossMarginPercent: number;
    readonly suggestedPricePerKg: number;
    readonly totalCostPerKg: number;
    readonly competitionInsight: {
      readonly competitionLevelLabel: string;
      readonly directSubstitutes: readonly string[];
      readonly positioningRecommendation: string;
    };
    readonly opportunitySummary: {
      readonly generatedAt: string;
      readonly initialInvestment: string;
      readonly paybackPeriod: string;
      readonly monthlyProfitability: string;
      readonly sustainabilityScore: string;
      readonly nextSteps: readonly string[];
      readonly ecoTip: string;
    };
    readonly chartLabels: readonly string[];
    readonly chartSeries: readonly number[];
  };
  readonly processSteps: readonly {
    readonly id: string;
    readonly order: number;
    readonly title: string;
    readonly shortDescription: string;
    readonly estimatedTime: string;
    readonly requiredEquipment: readonly string[];
    readonly keyActions: readonly string[];
    readonly quickTip: string;
    readonly riskLevel: string;
    readonly iconName: string;
  }[];
}

export interface ChatbotAnalysisRequest {
  readonly productId: string;
  readonly productName: string;
  readonly residueInput: string;
  readonly sectorName: string;
  readonly description?: string | null;
  readonly complexity?: string | null;
  readonly marketPotential?: string | null;
}

export interface SavedAnalysisListItem {
  readonly id: string;
  readonly listingId: string;
  readonly title: string;
  readonly recommendedProduct?: string | null;
  readonly sectorName?: string | null;
  readonly residueInput?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export interface SavedAnalysisListResult {
  readonly items: readonly SavedAnalysisListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

@Injectable({ providedIn: 'root' })
export class RecommendationsHttpRepository {
  private readonly http = inject(HttpClient);

  list(limit = 5, useAi = true, includeExplanation = true): Observable<readonly Recommendation[]> {
    return this.http
      .get<ApiResponse<readonly Recommendation[]>>(`${environment.apiBaseUrl}/recommendations`, {
        params: {
          limit,
          useAi,
          includeExplanation
        }
      })
      .pipe(
        map(unwrapApiResponse),
        map((items: readonly Recommendation[]) => items.map((item: Recommendation) => this.normalizeRecommendation(item))),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron cargar las recomendaciones.'))
        )
      );
  }

  getListingAnalysis(
    listingId: string,
    selectedProductId?: string | null,
    useAi = true,
    includeExplanation = true): Observable<RecommendationProcess> {
    return this.http
      .get<ApiResponse<ValueRouteDetailApi>>(`${environment.apiBaseUrl}/recommendations/listings/${listingId}/analysis`, {
        params: {
          selectedProductId: selectedProductId ?? '',
          useAi,
          includeExplanation
        }
      })
      .pipe(
        map(unwrapApiResponse),
        map((detail: ValueRouteDetailApi) => this.mapToRecommendationProcess(detail)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el analisis de la recomendacion.'))
        )
      );
  }

  getIndustrialProductDetail(productId: string): Observable<RecommendationProcess> {
    return this.http
      .get<ApiResponse<RecommendationProcess>>(`${environment.apiBaseUrl}/value-sectors/products/${productId}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el detalle industrial del producto.'))
        )
      );
  }

  getChatbotAnalysis(
    request: ChatbotAnalysisRequest,
    useAi = true,
    includeExplanation = true
  ): Observable<RecommendationProcess> {
    return this.http
      .post<ApiResponse<ValueRouteDetailApi>>(
        `${environment.apiBaseUrl}/recommendations/chatbot-analysis`,
        request,
        { params: { useAi, includeExplanation } }
      )
      .pipe(
        map(unwrapApiResponse),
        map((detail: ValueRouteDetailApi) => this.mapToRecommendationProcess(detail)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo generar el analisis de recomendacion desde chatbot.'))
        )
      );
  }

  saveListingAnalysis(
    listingId: string,
    selectedProductId?: string | null,
    useAi = true,
    includeExplanation = true): Observable<RecommendationProcess> {
    return this.http
      .post<ApiResponse<ValueRouteDetailApi>>(
        `${environment.apiBaseUrl}/recommendations/listings/${listingId}/analysis/save`,
        {},
        {
          params: {
            selectedProductId: selectedProductId ?? '',
            useAi,
            includeExplanation
          }
        })
      .pipe(
        map(unwrapApiResponse),
        map((detail: ValueRouteDetailApi) => this.mapToRecommendationProcess(detail)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo guardar el analisis de la recomendacion.'))
        )
      );
  }

  saveChatbotAnalysis(
    request: ChatbotAnalysisRequest,
    useAi = true,
    includeExplanation = true
  ): Observable<RecommendationProcess> {
    return this.http
      .post<ApiResponse<ValueRouteDetailApi>>(
        `${environment.apiBaseUrl}/recommendations/chatbot-analysis/save`,
        request,
        { params: { useAi, includeExplanation } }
      )
      .pipe(
        map(unwrapApiResponse),
        map((detail: ValueRouteDetailApi) => this.mapToRecommendationProcess(detail)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo guardar el analisis de recomendacion desde chatbot.'))
        )
      );
  }

  getChatbotAnalysisLatest(productId: string): Observable<RecommendationProcess> {
    return this.http
      .get<ApiResponse<{ data: ValueRouteDetailApi } | any>>(
        `${environment.apiBaseUrl}/recommendations/chatbot-analysis/latest`,
        { params: { productId } }
      )
      .pipe(
        map(unwrapApiResponse),
        map((record: any) => this.mapToRecommendationProcess((record?.data ?? record) as ValueRouteDetailApi)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el ultimo analisis guardado del chatbot.'))
        )
      );
  }

  getChatbotAnalysisHistory(productId: string, page = 1, pageSize = 10): Observable<readonly RecommendationProcess[]> {
    return this.http
      .get<ApiResponse<{ items: Array<{ data: ValueRouteDetailApi }> }>>(
        `${environment.apiBaseUrl}/recommendations/chatbot-analysis/history`,
        { params: { productId, page, pageSize } }
      )
      .pipe(
        map(unwrapApiResponse),
        map((payload) => (payload?.items ?? []).map((item) => this.mapToRecommendationProcess(item.data))),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el historial de analisis del chatbot.'))
        )
      );
  }

  getMySavedAnalyses(page = 1, pageSize = 10): Observable<SavedAnalysisListResult> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.apiBaseUrl}/recommendations/analyses/my`, {
        params: { page, pageSize }
      })
      .pipe(
        map(unwrapApiResponse),
        map((payload: unknown) => this.mapSavedAnalyses(payload, page, pageSize)),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron cargar las ideas guardadas.'))
        )
      );
  }

  getListingAnalysisHistory(listingId: string): Observable<readonly RecommendationProcess[]> {
    return this.http
      .get<ApiResponse<unknown>>(`${environment.apiBaseUrl}/recommendations/listings/${listingId}/analysis/history`)
      .pipe(
        map(unwrapApiResponse),
        map((payload: unknown) => this.extractHistoryItems(payload).map((item) => this.mapToRecommendationProcess(item))),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el historial del analisis.'))
        )
      );
  }

  private mapToRecommendationProcess(detail: ValueRouteDetailApi): RecommendationProcess {
    const buyers: readonly BuyerSegment[] = (detail.marketAnalysis?.potentialBuyers ?? []).map((buyer) => ({
      id: buyer.id,
      name: buyer.name,
      segment: buyer.segment,
      monthlyVolume: buyer.monthlyVolume,
      probability: this.normalizeScore(Number(buyer.probability)),
      channel: this.normalizeChannel(buyer.channel),
      scope: this.normalizeBuyerScope(buyer.type, buyer.marketScope, buyer.country),
      region: this.resolveBuyerRegion(buyer.region, buyer.country, buyer.type, buyer.marketScope),
      country: this.resolveBuyerCountry(buyer.country, buyer.type, buyer.marketScope),
      iconName: this.normalizeBuyerIcon(buyer.iconName)
    }));

    return {
      recommendationId: detail.recommendationId,
      source: detail.source ?? null,
      recommendedProduct: detail.recommendedProduct,
      baseResidue: detail.baseResidue,
      complexity: this.normalizeLevel(detail.complexity),
      totalEstimatedTime: detail.totalEstimatedTime,
      approximateCost: detail.approximateCost,
      marketPotential: this.normalizeLevel(detail.marketPotential),
      principalEquipment: detail.principalEquipment ?? [],
      expectedOutcome: detail.expectedOutcome,
      explanation: detail.explanation,
      manufacturingProcess: detail.manufacturingProcess ?? null,
      complexityOverview: detail.complexityOverview ?? null,
      explanationSteps: (detail.explanationSteps ?? []).map((step) => ({
        id: step.id,
        order: step.order,
        title: step.title,
        shortLabel: step.shortLabel,
        transformationType: step.transformationType,
        whatHappens: step.whatHappens,
        whyItMatters: step.whyItMatters,
        transformationOutcome: step.transformationOutcome,
        quickTip: step.quickTip,
        avoidRisk: step.avoidRisk,
        processImageUrl: step.processImageUrl,
        environmentalFactors: {
          positive: step.environmentalFactors?.positive ?? [],
          negative: step.environmentalFactors?.negative ?? []
        },
        natureBenefits: step.natureBenefits ?? [],
        iconName: this.normalizeProcessIcon(step.iconName)
      })),
      environmentalSummary: {
        impactScore: Number(detail.environmentalSummary?.impactScore),
        utilizationLevelLabel: detail.environmentalSummary?.utilizationLevelLabel ?? '',
        utilizationPercent: Number(detail.environmentalSummary?.utilizationPercent),
        environmentalRiskLabel: detail.environmentalSummary?.environmentalRiskLabel ?? '',
        environmentalRiskPercent: Number(detail.environmentalSummary?.environmentalRiskPercent),
        keyRecommendation: detail.environmentalSummary?.keyRecommendation ?? ''
      },
      marketAnalysis: {
        finishedProduct: {
          name: detail.marketAnalysis?.finishedProduct?.name ?? detail.recommendedProduct,
          useCase: detail.marketAnalysis?.finishedProduct?.useCase ?? detail.expectedOutcome,
          suggestedFormat: detail.marketAnalysis?.finishedProduct?.suggestedFormat ?? '',
          suggestedPricePerKg: Number(detail.marketAnalysis?.finishedProduct?.suggestedPricePerKg ?? 0),
          opportunityTag: this.translateMarketText(detail.marketAnalysis?.finishedProduct?.opportunityTag ?? ''),
          productImageUrl: detail.marketAnalysis?.finishedProduct?.productImageUrl ?? ''
        },
        potentialBuyers: buyers,
        marketKpis: (detail.marketAnalysis?.marketKpis ?? []).map((kpi) => ({
          id: kpi.id,
          label: this.translateMarketText(kpi.label),
          value: this.translateMarketText(kpi.value),
          helper: this.translateMarketText(kpi.helper),
          trendPercent: Number(kpi.trendPercent ?? 0),
          tone: this.normalizeKpiTone(kpi.tone)
        })),
        costStructure: (detail.marketAnalysis?.costStructure ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          amountUsd: Number(item.amountUsd ?? 0),
          percent: Number(item.percent ?? 0)
        })),
        estimatedGrossMarginPercent: Number(detail.marketAnalysis?.estimatedGrossMarginPercent ?? 0),
        suggestedPricePerKg: Number(detail.marketAnalysis?.suggestedPricePerKg ?? 0),
        totalCostPerKg: Number(detail.marketAnalysis?.totalCostPerKg ?? 0),
        competitionInsight: {
          competitionLevelLabel: detail.marketAnalysis?.competitionInsight?.competitionLevelLabel ?? 'Media',
          directSubstitutes: detail.marketAnalysis?.competitionInsight?.directSubstitutes ?? [],
          positioningRecommendation: detail.marketAnalysis?.competitionInsight?.positioningRecommendation ?? ''
        },
        opportunitySummary: {
          generatedAt: this.translateMarketText(detail.marketAnalysis?.opportunitySummary?.generatedAt ?? ''),
          initialInvestment: this.normalizeCurrencyText(detail.marketAnalysis?.opportunitySummary?.initialInvestment ?? ''),
          paybackPeriod: this.translateMarketText(detail.marketAnalysis?.opportunitySummary?.paybackPeriod ?? ''),
          monthlyProfitability: this.normalizeCurrencyText(detail.marketAnalysis?.opportunitySummary?.monthlyProfitability ?? ''),
          sustainabilityScore: detail.marketAnalysis?.opportunitySummary?.sustainabilityScore ?? '',
          nextSteps: (detail.marketAnalysis?.opportunitySummary?.nextSteps ?? []).map((step) => this.translateMarketText(step)),
          ecoTip: this.translateMarketText(detail.marketAnalysis?.opportunitySummary?.ecoTip ?? '')
        },
        chartLabels: detail.marketAnalysis?.chartLabels ?? [],
        chartSeries: (detail.marketAnalysis?.chartSeries ?? []).map((value) => Number(value ?? 0))
      },
      processSteps: (detail.processSteps ?? []).map((step) => ({
        id: step.id,
        order: step.order,
        title: step.title,
        shortDescription: step.shortDescription,
        estimatedTime: step.estimatedTime,
        requiredEquipment: step.requiredEquipment ?? [],
        keyActions: step.keyActions ?? [],
        quickTip: step.quickTip,
        riskLevel: this.normalizeLevel(step.riskLevel),
        iconName: this.normalizeProcessIcon(step.iconName)
      }))
    };
  }

  private normalizeLevel(level: string): 'low' | 'medium' | 'high' {
    const normalized = (level ?? '').trim().toLowerCase();
    if (normalized === 'low' || normalized === 'high') {
      return normalized;
    }

    return 'medium';
  }

  private normalizeBuyerScope(type: string, marketScope?: string, country?: string): 'nacional' | 'internacional' {
    const byScope = (marketScope ?? '').trim().toLowerCase();
    if (byScope.includes('international') || byScope.includes('internacional')) {
      return 'internacional';
    }

    const byCountry = (country ?? '').trim().toLowerCase();
    if (byCountry && byCountry !== 'peru' && byCountry !== 'perú') {
      return 'internacional';
    }

    const normalized = (type ?? '').trim().toLowerCase();
    return normalized.includes('international') ? 'internacional' : 'nacional';
  }

  private resolveBuyerCountry(country: string | undefined, type: string, marketScope?: string): string {
    const value = (country ?? '').trim();
    if (value) {
      return value;
    }

    return this.normalizeBuyerScope(type, marketScope, country) === 'internacional'
      ? 'No se encontró la información'
      : 'Perú';
  }

  private resolveBuyerRegion(region: string | undefined, country: string | undefined, type: string, marketScope?: string): string {
    const value = (region ?? '').trim();
    if (value) {
      return value;
    }

    return this.normalizeBuyerScope(type, marketScope, country) === 'internacional'
      ? 'Internacional'
      : 'No se encontró la información';
  }

  private normalizeBuyerIcon(icon: string): 'building' | 'store' | 'leaf' {
    const normalized = (icon ?? '').trim().toLowerCase();
    if (normalized === 'store' || normalized === 'leaf') {
      return normalized;
    }

    return 'building';
  }

  private normalizeProcessIcon(icon: string):
    | 'package-search'
    | 'droplets'
    | 'wind'
    | 'factory'
    | 'scan-line'
    | 'package'
    | 'archive' {
    const normalized = (icon ?? '').trim().toLowerCase();
    switch (normalized) {
      case 'package-search':
      case 'droplets':
      case 'wind':
      case 'factory':
      case 'scan-line':
      case 'package':
      case 'archive':
        return normalized;
      default:
        return 'package';
    }
  }

  private normalizeKpiTone(tone: string): 'emerald' | 'slate' | 'amber' {
    const normalized = (tone ?? '').trim().toLowerCase();
    if (normalized === 'emerald' || normalized === 'amber') {
      return normalized;
    }

    return 'slate';
  }

  private translateMarketText(text: string): string {
    if (!text) {
      return text;
    }

    return text
      .replace(/Opportunity:\s*High/gi, 'Oportunidad: Alta')
      .replace(/Opportunity:\s*Medium/gi, 'Oportunidad: Media')
      .replace(/Opportunity:\s*Low/gi, 'Oportunidad: Baja')
      .replace(/Potential Demand/gi, 'Demanda potencial')
      .replace(/Impact/gi, 'Impacto')
      .replace(/Competition/gi, 'Competencia')
      .replace(/Growth/gi, 'Crecimiento')
      .replace(/Niche opportunity/gi, 'Oportunidad de nicho')
      .replace(/High/gi, 'Alto')
      .replace(/Low/gi, 'Bajo');
  }

  private normalizeCurrencyText(text: string): string {
    return this.translateMarketText(text ?? '');
  }

  private normalizeChannel(channel: string): string {
    const normalized = (channel ?? '').trim().toLowerCase();
    switch (normalized) {
      case 'direct':
      case 'directo':
        return 'Directo';
      case 'b2b':
        return 'B2B';
      case 'whatsapp':
        return 'WhatsApp';
      case 'retail':
        return 'Retail';
      default:
        return channel;
    }
  }

  private normalizeRecommendation(item: Recommendation): Recommendation {
    return {
      ...item,
      confidenceScore: this.normalizeScore(item.confidenceScore)
    };
  }

  private normalizeScore(score: number): number {
    if (Number.isNaN(score)) {
      return 0;
    }

    if (score >= 0 && score <= 1) {
      return Math.round(score * 100);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private mapSavedAnalyses(payload: unknown, fallbackPage: number, fallbackPageSize: number): SavedAnalysisListResult {
    const source = this.asRecord(payload);
    const rawItems = Array.isArray(payload)
      ? payload
      : Array.isArray(source?.['items'])
        ? source['items']
        : Array.isArray(source?.['data'])
          ? source['data']
          : [];

    const items = rawItems
      .map((entry, index) => this.mapSavedAnalysisItem(entry, index))
      .filter((item): item is SavedAnalysisListItem => !!item);

    const page = this.asNumber(source?.['page']) ?? fallbackPage;
    const pageSize = this.asNumber(source?.['pageSize']) ?? fallbackPageSize;
    const total = this.asNumber(source?.['total']) ?? items.length;

    return {
      items,
      page,
      pageSize,
      total
    };
  }

  private mapSavedAnalysisItem(value: unknown, index: number): SavedAnalysisListItem | null {
    const node = this.asRecord(value);
    if (!node) {
      return null;
    }

    const listingId = this.asString(node['listingId'])
      ?? this.asString(node['listing_id'])
      ?? this.asString(node['listingGuid'])
      ?? this.asString(node['listing_guid'])
      ?? '';
    const id = this.asString(node['id'])
      ?? this.asString(node['analysisId'])
      ?? this.asString(node['analysis_id'])
      ?? `${listingId || 'analysis'}-${index}`;

    return {
      id,
      listingId,
      title: this.asString(node['title'])
        ?? this.asString(node['recommendedProduct'])
        ?? this.asString(node['productName'])
        ?? 'Idea guardada',
      recommendedProduct: this.asString(node['recommendedProduct']) ?? this.asString(node['productName']) ?? null,
      sectorName: this.asString(node['sectorName']) ?? this.asString(node['sector']) ?? null,
      residueInput: this.asString(node['residueInput']) ?? this.asString(node['residue']) ?? null,
      createdAt: this.asString(node['createdAt']) ?? this.asString(node['created_at']) ?? null,
      updatedAt: this.asString(node['updatedAt']) ?? this.asString(node['updated_at']) ?? null
    };
  }

  private extractHistoryItems(payload: unknown): ValueRouteDetailApi[] {
    if (Array.isArray(payload)) {
      return payload
        .map((entry) => this.extractHistoryDetail(entry))
        .filter((entry): entry is ValueRouteDetailApi => !!entry);
    }

    const source = this.asRecord(payload);
    const rawItems = Array.isArray(source?.['items'])
      ? source['items']
      : Array.isArray(source?.['data'])
        ? source['data']
        : Array.isArray(source?.['history'])
          ? source['history']
          : [];

    return rawItems
      .map((entry) => this.extractHistoryDetail(entry))
      .filter((entry): entry is ValueRouteDetailApi => !!entry);
  }

  private extractHistoryDetail(entry: unknown): ValueRouteDetailApi | null {
    const node = this.asRecord(entry);
    if (!node) {
      return null;
    }

    const dataNode = this.asRecord(node['data']);
    const detail = dataNode ?? node;
    if (!this.asString(detail['recommendationId']) || !this.asString(detail['recommendedProduct'])) {
      return null;
    }

    return detail as unknown as ValueRouteDetailApi;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private asString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
