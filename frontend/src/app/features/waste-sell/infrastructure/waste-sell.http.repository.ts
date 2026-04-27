import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import { EMPTY_WASTE_SELL_STATE } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellRepository } from '../domain/waste-sell.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellHttpRepository implements WasteSellRepository {
  private readonly http = inject(HttpClient);

  getInitialState(): Observable<WasteSellPageState> {
    return of(EMPTY_WASTE_SELL_STATE);
  }

  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState> {
    return this.http
      .put<ApiResponse<WasteSellPageState>>(`${environment.apiBaseUrl}/waste-sell/draft`, this.toRequestState(state))
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo guardar el borrador.')))
      );
  }

  publish(state: WasteSellPageState): Observable<WasteSellPageState> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.apiBaseUrl}/waste-sell/publish`, this.toRequestState(state))
      .pipe(
        map((response) => {
          unwrapApiResponse(response);
          return {
            ...state,
            draftSavedAt: new Date().toISOString()
          };
        }),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo publicar el listado.')))
      );
  }

  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary> {
    return this.http
      .post<ApiResponse<ListingPreviewSummary>>(`${environment.apiBaseUrl}/waste-sell/preview`, this.toRequestState(state))
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo generar la vista previa.')))
      );
  }

  private toRequestState(state: WasteSellPageState): WasteSellPageState {
    return {
      ...state,
      formValue: {
        ...state.formValue,
        mediaUploads: state.formValue.mediaUploads
          .filter((media) => media.uploadStatus === 'uploaded' && !media.previewUrl.startsWith('blob:'))
          .map((media) => ({
            id: media.mediaId ?? media.id,
            name: media.name,
            previewUrl: media.previewUrl,
            sizeKb: media.sizeKb,
            type: media.type
          }))
      }
    };
  }
}
