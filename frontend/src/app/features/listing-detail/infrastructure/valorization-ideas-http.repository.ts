import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { WasteSellPageState } from '../../waste-sell/domain/waste-sell.models';
import { ValorizationIdea } from '../domain/valorization-ideas.models';

@Injectable({ providedIn: 'root' })
export class ValorizationIdeasHttpRepository {
  private readonly http = inject(HttpClient);

  getByListingId(listingId: string): Observable<readonly ValorizationIdea[]> {
    return this.http
      .get<ApiResponse<readonly ValorizationIdea[]>>(
        `${environment.apiBaseUrl}/listings/${listingId}/valorization-ideas`
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudieron cargar las ideas de valorizacion.')))
      );
  }

  generate(listingId: string): Observable<readonly ValorizationIdea[]> {
    return this.http
      .post<ApiResponse<readonly ValorizationIdea[]>>(
        `${environment.apiBaseUrl}/listings/${listingId}/valorization-ideas/generate`,
        null
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudieron generar las ideas con IA.')))
      );
  }

  previewFromWasteSell(payload: WasteSellPageState): Observable<readonly ValorizationIdea[]> {
    return this.http
      .post<ApiResponse<readonly ValorizationIdea[]>>(`${environment.apiBaseUrl}/valorization-ideas/preview`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron generar las ideas con IA.'))
        )
      );
  }
}
