import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import { DashboardSummary } from '../domain/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardHttpRepository {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<DashboardSummary> {
    return this.http
      .get<ApiResponse<DashboardSummary>>(`${environment.apiBaseUrl}/dashboard/summary`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar el dashboard.'))
        )
      );
  }
}
