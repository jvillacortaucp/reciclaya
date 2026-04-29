import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { CreateCommercialRequestPayload, CommercialRequestItem } from './domain/requests.models';

@Injectable({ providedIn: 'root' })
export class RequestsHttpRepository {
  private readonly http = inject(HttpClient);

  list(): Observable<readonly CommercialRequestItem[]> {
    return this.http
      .get<ApiResponse<readonly CommercialRequestItem[]>>(`${environment.apiBaseUrl}/requests`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudieron cargar las solicitudes.'))
      );
  }

  getById(id: string): Observable<CommercialRequestItem | null> {
    return this.http
      .get<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests/${id}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo cargar la solicitud.'))
      );
  }

  create(payload: CreateCommercialRequestPayload): Observable<CommercialRequestItem> {
    return this.http
      .post<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo crear la solicitud.'))
      );
  }

  accept(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'accept', 'No se pudo aceptar la solicitud.');
  }

  reject(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'reject', 'No se pudo rechazar la solicitud.');
  }

  cancel(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'cancel', 'No se pudo cancelar la solicitud.');
  }

  private patchAction(
    id: string,
    action: 'accept' | 'reject' | 'cancel',
    fallbackMessage: string
  ): Observable<CommercialRequestItem | null> {
    return this.http
      .patch<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests/${id}/${action}`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, fallbackMessage))
      );
  }

  private handleHttpError(error: unknown, fallbackMessage: string): Observable<never> {
    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }
}
