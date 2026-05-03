import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';

export interface AdminCompany {
  readonly id: string;
  readonly businessName: string;
  readonly ruc: string;
  readonly verificationStatus: 'pending' | 'verified' | 'rejected';
  readonly createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminCompaniesRepository {
  private readonly http = inject(HttpClient);

  getCompanies(): Observable<readonly AdminCompany[]> {
    return this.http
      .get<ApiResponse<readonly AdminCompany[]>>(`${environment.apiBaseUrl}/admin/companies`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron cargar las empresas.'))
        )
      );
  }

  verifyCompany(id: string): Observable<AdminCompany> {
    return this.patchVerification(id, 'verify');
  }

  rejectCompany(id: string): Observable<AdminCompany> {
    return this.patchVerification(id, 'reject');
  }

  private patchVerification(id: string, action: 'verify' | 'reject'): Observable<AdminCompany> {
    return this.http
      .patch<ApiResponse<AdminCompany>>(`${environment.apiBaseUrl}/admin/companies/${id}/${action}`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo actualizar la verificacion.'))
        )
      );
  }
}
