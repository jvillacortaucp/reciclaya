import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { RecommendationProcess } from '../../recommendations/models/recommendation.model';
import { ValueSectorFromListingResponse, ValueSectorPageResponse, ValueSectorRoute } from '../models/value-sector.model';

export interface ValueSectorQueryParams {
  readonly sector?: string;
  readonly residueType?: string;
  readonly productType?: string;
  readonly specificResidue?: string;
  readonly listingId?: string;
  readonly useAi?: boolean;
  readonly limit?: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ValueSectorPreviewPayload {
  readonly residueType?: string;
  readonly sector?: string;
  readonly productType?: string;
  readonly specificResidue?: string;
  readonly description?: string;
  readonly condition?: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly location?: string;
  readonly exchangeType?: string;
  readonly useAi?: boolean;
}

export interface ValueSectorGeneratePayload {
  readonly regenerationSeed?: string;
  readonly excludeRouteIds?: readonly string[];
  readonly excludeProductIds?: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class ValueSectorHttpRepository {
  private readonly http = inject(HttpClient);

  getValueSectors(params: ValueSectorQueryParams): Observable<ValueSectorPageResponse> {
    return this.http
      .get<ApiResponse<ValueSectorPageResponse>>(`${environment.apiBaseUrl}/value-sectors`, {
        params: this.toParams(params)
      })
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => this.normalize(error, 'No se pudieron cargar sectores de valor.')))
      );
  }

  getValueSector(routeId: string): Observable<ValueSectorRoute> {
    return this.http
      .get<ApiResponse<ValueSectorRoute>>(`${environment.apiBaseUrl}/value-sectors/${routeId}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => this.normalize(error, 'No se pudo cargar la ruta de valor.')))
      );
  }

  getProductDetail(productId: string): Observable<RecommendationProcess> {
    return this.http
      .get<ApiResponse<RecommendationProcess>>(`${environment.apiBaseUrl}/value-sectors/products/${productId}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => this.normalize(error, 'No se pudo cargar el detalle industrial del producto.'))
        )
      );
  }

  previewValueSectors(payload: ValueSectorPreviewPayload): Observable<readonly ValueSectorRoute[]> {
    return this.http
      .post<ApiResponse<readonly ValueSectorRoute[]>>(`${environment.apiBaseUrl}/value-sectors/preview`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => this.normalize(error, 'No se pudo generar el preview de sectores de valor.'))
        )
      );
  }

  getFromListing(listingId: string, useAi = true, limit?: number): Observable<ValueSectorFromListingResponse> {
    const params = this.toParams({ useAi, limit });
    return this.http
      .get<ApiResponse<ValueSectorFromListingResponse>>(`${environment.apiBaseUrl}/value-sectors/from-listing/${listingId}`, {
        params
      })
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => this.normalize(error, 'No se pudieron cargar sectores desde el listing.'))
        )
      );
  }

  generateFromListing(
    listingId: string,
    payload?: ValueSectorGeneratePayload,
    limit?: number
  ): Observable<ValueSectorFromListingResponse> {
    const params = this.toParams({ limit });
    return this.http
      .post<ApiResponse<ValueSectorFromListingResponse>>(
        `${environment.apiBaseUrl}/value-sectors/from-listing/${listingId}/generate`,
        payload ?? {},
        { params }
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => this.normalize(error, 'No se pudieron generar sectores desde el listing.'))
        )
      );
  }

  private toParams(params: ValueSectorQueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }

  private normalize(error: unknown, fallback: string): unknown {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return error;
    }
    return normalizeHttpError(error, fallback);
  }
}
