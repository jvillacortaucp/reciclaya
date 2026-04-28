import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse, Recommendation, RecommendationDetail } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { RecommendationProcess } from './models/recommendation.model';
import { RecommendationsService } from './infrastructure/recommendations.service';
import { RecommendationsMockRepository } from './recommendations.service';

@Injectable({ providedIn: 'root' })
export class RecommendationsHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly fallback = inject(RecommendationsMockRepository);
  private readonly processFallback = inject(RecommendationsService);

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
        map((items) => items.map((item) => this.normalizeRecommendation(item))),
        catchError((error: unknown) => this.fallbackOnNetworkError(error))
      );
  }

  getListingAnalysis(listingId: string, useAi = true, includeExplanation = true): Observable<RecommendationDetail> {
    return this.http
      .get<ApiResponse<RecommendationDetail>>(`${environment.apiBaseUrl}/recommendations/listings/${listingId}/analysis`, {
        params: {
          useAi,
          includeExplanation
        }
      })
      .pipe(
        map(unwrapApiResponse),
        map((detail) => ({
          ...detail,
          confidenceScore: this.normalizeScore(Number(detail.confidenceScore))
        })),
        catchError((error: unknown) => this.fallbackOnNetworkErrorDetail(error, listingId))
      );
  }

  getIndustrialProductDetail(productId: string): Observable<RecommendationProcess> {
    return this.http
      .get<ApiResponse<RecommendationProcess>>(`${environment.apiBaseUrl}/value-sectors/products/${productId}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            return this.processFallback.getProcessRecommendation(productId);
          }

          return throwError(() => normalizeHttpError(error, 'No se pudo cargar el detalle industrial del producto.'));
        })
      );
  }

  private fallbackOnNetworkError(error: unknown): Observable<readonly Recommendation[]> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return this.fallback.list().pipe(map((items) => items.map((item) => this.normalizeRecommendation(item))));
    }

    return throwError(() => normalizeHttpError(error, 'No se pudieron cargar las recomendaciones.'));
  }

  private fallbackOnNetworkErrorDetail(error: unknown, listingId: string): Observable<RecommendationDetail> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      // Use mock list only for network/offline scenarios
      return this.fallback.list().pipe(
        map((items) => items.map((item) => this.normalizeRecommendation(item))),
        map((items) => items.find((item) => item.listingId === listingId) ?? items[0]),
        map((item) => ({
          listingId: item?.listingId ?? listingId,
          listingTitle: item?.title ?? 'Recomendacion',
          aiExplanation: item?.reason ?? 'No se pudo cargar el analisis detallado.',
          recommendedUse: item?.recommendedUse ?? 'Validar uso tecnico con el seller.',
          buyerBenefit: item?.buyerBenefit ?? 'Oportunidad de compra segun disponibilidad.',
          suggestedAction: item?.suggestedAction ?? 'Solicitar informacion adicional al seller.',
          potentialProducts: item?.potentialProducts ?? [],
          requiredConditions: item?.requiredConditions ?? [],
          risks: item?.risks ?? ['Validar condiciones tecnicas antes de comprar.'],
          nextStep: item?.nextStep ?? 'Contactar al seller para validar detalles.',
          confidenceScore: item?.confidenceScore ?? 50,
          viabilityLevel: item?.viabilityLevel ?? 'medium',
          source: item?.source ?? 'fallback'
        }))
      );
    }

    return throwError(() => normalizeHttpError(error, 'No se pudo cargar el analisis de la recomendacion.'));
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
}
