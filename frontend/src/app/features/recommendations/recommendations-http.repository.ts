import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse, Recommendation } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { RecommendationsMockRepository } from './recommendations.service';

@Injectable({ providedIn: 'root' })
export class RecommendationsHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly fallback = inject(RecommendationsMockRepository);

  list(): Observable<readonly Recommendation[]> {
    return this.http
      .get<ApiResponse<readonly Recommendation[]>>(`${environment.apiBaseUrl}/recommendations`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.fallbackOnNetworkError(error))
      );
  }

  private fallbackOnNetworkError(error: unknown): Observable<readonly Recommendation[]> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return this.fallback.list();
    }

    return throwError(() => normalizeHttpError(error, 'No se pudieron cargar las recomendaciones.'));
  }
}
