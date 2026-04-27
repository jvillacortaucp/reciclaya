import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { CreateCommercialRequestPayload, CommercialRequestItem } from './domain/requests.models';
import { RequestsMockRepository } from './requests.repository';

@Injectable({ providedIn: 'root' })
export class RequestsHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly fallback = inject(RequestsMockRepository);

  list(): Observable<readonly CommercialRequestItem[]> {
    return this.http
      .get<ApiResponse<readonly CommercialRequestItem[]>>(`${environment.apiBaseUrl}/requests`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudieron cargar las solicitudes.', () => this.fallback.list())
        )
      );
  }

  getById(id: string): Observable<CommercialRequestItem | null> {
    return this.http
      .get<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests/${id}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudo cargar la solicitud.', () => this.fallback.getById(id))
        )
      );
  }

  create(payload: CreateCommercialRequestPayload): Observable<CommercialRequestItem> {
    return this.http
      .post<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudo crear la solicitud.', () => this.fallback.create(payload))
        )
      );
  }

  accept(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'accept', 'No se pudo aceptar la solicitud.', () => this.fallback.accept(id));
  }

  reject(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'reject', 'No se pudo rechazar la solicitud.', () => this.fallback.reject(id));
  }

  cancel(id: string): Observable<CommercialRequestItem | null> {
    return this.patchAction(id, 'cancel', 'No se pudo cancelar la solicitud.', () => this.fallback.cancel(id));
  }

  private patchAction(
    id: string,
    action: 'accept' | 'reject' | 'cancel',
    fallbackMessage: string,
    fallbackFactory: () => Observable<CommercialRequestItem | null>
  ): Observable<CommercialRequestItem | null> {
    return this.http
      .patch<ApiResponse<CommercialRequestItem>>(`${environment.apiBaseUrl}/requests/${id}/${action}`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.fallbackOnNetworkError(error, fallbackMessage, fallbackFactory))
      );
  }

  private fallbackOnNetworkError<T>(
    error: unknown,
    fallbackMessage: string,
    fallbackFactory: () => Observable<T>
  ): Observable<T> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return fallbackFactory();
    }

    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }
}
