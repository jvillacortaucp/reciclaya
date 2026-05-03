import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import { PurchasePreferencesPageState, SummaryPreviewData } from '../domain/purchase-preferences.models';
import { PurchasePreferencesRepository } from '../domain/purchase-preferences.repository';

@Injectable({ providedIn: 'root' })
export class PurchasePreferencesHttpRepository implements PurchasePreferencesRepository {
  private readonly http = inject(HttpClient);

  getInitialState(): Observable<PurchasePreferencesPageState> {
    return this.http
      .get<ApiResponse<PurchasePreferencesPageState>>(`${environment.apiBaseUrl}/purchase-preferences/current`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudieron cargar las preferencias de compra.'))
      );
  }

  savePreference(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState> {
    return this.http
      .put<ApiResponse<PurchasePreferencesPageState>>(
        `${environment.apiBaseUrl}/purchase-preferences/current`,
        state.formValue
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo guardar la preferencia.'))
      );
  }

  activateAlert(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState> {
    return this.http
      .post<ApiResponse<PurchasePreferencesPageState>>(
        `${environment.apiBaseUrl}/purchase-preferences/current/activate-alert`,
        state.formValue
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo activar la alerta.'))
      );
  }

  buildSummary(state: PurchasePreferencesPageState): Observable<SummaryPreviewData> {
    return this.http
      .post<ApiResponse<SummaryPreviewData>>(
        `${environment.apiBaseUrl}/purchase-preferences/summary`,
        state.formValue
      )
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo generar el resumen.'))
      );
  }

  private handleHttpError(error: unknown, fallbackMessage: string): Observable<never> {
    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }
}
