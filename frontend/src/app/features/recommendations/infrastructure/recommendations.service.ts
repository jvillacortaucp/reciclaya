import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { RECOMMENDATION_PRODUCT_OVERRIDES } from '../data/recommendation-product-overrides.mock';
import { RECOMMENDATION_PROCESS_MOCK } from '../data/recommendation-process.mock';
import { RecommendationProcess } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private readonly latency = inject(APP_LATENCY_MS);

  getProcessRecommendation(productId?: string | null): Observable<RecommendationProcess> {
    const recommendation = this.buildRecommendation(productId);
    return of(recommendation).pipe(delay(this.latency));
  }

  private buildRecommendation(productId?: string | null): RecommendationProcess {
    const normalizedId = productId?.trim();
    if (!normalizedId) {
      return RECOMMENDATION_PROCESS_MOCK;
    }

    const override = RECOMMENDATION_PRODUCT_OVERRIDES[normalizedId];
    if (!override) {
      return RECOMMENDATION_PROCESS_MOCK;
    }

    return {
      ...RECOMMENDATION_PROCESS_MOCK,
      recommendationId: `rec-${normalizedId}`,
      recommendedProduct: override.recommendedProduct,
      complexity: override.complexity,
      marketPotential: override.marketPotential,
      totalEstimatedTime: override.totalEstimatedTime,
      approximateCost: override.approximateCost,
      expectedOutcome: override.expectedOutcome,
      marketAnalysis: {
        ...RECOMMENDATION_PROCESS_MOCK.marketAnalysis,
        finishedProduct: {
          ...RECOMMENDATION_PROCESS_MOCK.marketAnalysis.finishedProduct,
          name: override.recommendedProduct,
          useCase: override.useCase,
          suggestedFormat: override.suggestedFormat,
          suggestedPricePerKg: override.suggestedPricePerKg,
          opportunityTag: override.opportunityTag
        },
        suggestedPricePerKg: override.suggestedPricePerKg
      }
    };
  }
}
