import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { RegulationHttpService } from '../../../core/regulatory/regulation-http.service';
import { environment } from '../../../../environments/environment';
import { EMPTY_WASTE_SELL_STATE } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellPublishResult, WasteSellRepository } from '../domain/waste-sell.repository';
import { MyListingsRepository } from '../../my-listings/my-listings.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellHttpRepository implements WasteSellRepository {
  private readonly http = inject(HttpClient);
  private readonly myListingsRepository = inject(MyListingsRepository);
  private readonly regulationHttpService = inject(RegulationHttpService);

  getInitialState(listingId?: string | null): Observable<WasteSellPageState> {
    if (!listingId) {
      return of(EMPTY_WASTE_SELL_STATE);
    }

    return this.myListingsRepository.getEditState(listingId);
  }

  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState> {
    return this.http
      .put<ApiResponse<WasteSellPageState>>(`${environment.apiBaseUrl}/waste-sell/draft`, this.toRequestState(state))
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo guardar el borrador.')))
      );
  }

  publish(state: WasteSellPageState, listingId?: string | null): Observable<WasteSellPublishResult> {
    return this.regulationHttpService
      .validateOperation({
        action: 'publish',
        actor: 'seller',
        residueType: state.formValue.residueType,
        sector: state.formValue.sector,
        productType: state.formValue.productType,
        specificResidue: state.formValue.specificResidue,
        quantity: state.formValue.volume.quantity,
        unit: state.formValue.volume.unit
      })
      .pipe(
        switchMap((validation) => {
          if (!validation.allowed) {
            throw new Error(validation.blockingMessage || validation.upgradeCallToAction || 'No cumples el nivel regulatorio requerido.');
          }

          return this.http.post<ApiResponse<{ complianceWarnings?: unknown[] }>>(`${environment.apiBaseUrl}/waste-sell/publish`, this.toRequestState(state), {
            params: listingId ? { listingId } : undefined
          });
        }),
        map((response) => {
          const payload = unwrapApiResponse(response) ?? {};
          return {
            state: {
              ...state,
              draftSavedAt: new Date().toISOString()
            },
            complianceWarnings: Array.isArray(payload.complianceWarnings)
              ? (payload.complianceWarnings as WasteSellPublishResult['complianceWarnings'])
              : []
          };
        }),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo publicar el listado.')))
      );
  }

  verifyListingEvidence(state: WasteSellPageState) {
    const mediaUrls = state.formValue.mediaUploads
      .map((item) => item.previewUrl)
      .filter((item) => !!item && !item.startsWith('blob:'));

    return this.regulationHttpService.verifyListingEvidence({
      specificResidue: state.formValue.specificResidue,
      residueType: state.formValue.residueType,
      sector: state.formValue.sector,
      productType: state.formValue.productType,
      quantity: state.formValue.volume.quantity,
      unit: state.formValue.volume.unit,
      mediaUrls
    });
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
