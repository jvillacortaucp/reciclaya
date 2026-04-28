import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { ValorizationIdeaApiItem, ValorizationIdeasResponse } from '../models/value-sector-api.model';

@Injectable({ providedIn: 'root' })
export class ValueSectorApiService {
  private readonly http = inject(HttpClient);

  generateValorizationIdeas(listingId: string): Observable<ValorizationIdeasResponse> {
    return this.http
      .post<ApiResponse<readonly ValorizationIdeaApiItem[]> | readonly ValorizationIdeaApiItem[]>(
        `${environment.apiBaseUrl}/listings/${listingId}/valorization-ideas/generate`,
        {}
      )
      .pipe(
        map((response) => this.unwrapResponse(response)),
        catchError((error: unknown) =>
          throwError(() =>
            normalizeHttpError(error, 'No se pudieron generar las rutas de valor para este residuo.')
          )
        )
      );
  }

  private unwrapResponse(
    response: ApiResponse<readonly ValorizationIdeaApiItem[]> | readonly ValorizationIdeaApiItem[]
  ): ValorizationIdeasResponse {
    if (this.isApiResponse(response)) {
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'No se pudieron generar las rutas de valor para este residuo.');
      }

      return Array.isArray(response.data) ? response.data : [];
    }

    return Array.isArray(response) ? response : [];
  }

  private isApiResponse(
    response: ApiResponse<readonly ValorizationIdeaApiItem[]> | readonly ValorizationIdeaApiItem[]
  ): response is ApiResponse<readonly ValorizationIdeaApiItem[]> {
    return 'success' in response;
  }
}
