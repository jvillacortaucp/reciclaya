import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { MarketplaceListing } from '../marketplace/domain/marketplace.models';
import { WasteSellPageState } from '../waste-sell/domain/waste-sell.models';

@Injectable({ providedIn: 'root' })
export class MyListingsRepository {
  private readonly http = inject(HttpClient);

  getMyListings(): Observable<readonly MarketplaceListing[]> {
    return this.http
      .get<ApiResponse<readonly MarketplaceListing[]>>(`${environment.apiBaseUrl}/my-listings`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron cargar tus publicaciones.'))
        )
      );
  }

  getEditState(id: string): Observable<WasteSellPageState> {
    return this.http
      .get<ApiResponse<WasteSellPageState>>(`${environment.apiBaseUrl}/my-listings/${id}/edit-state`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cargar la publicación para editar.'))
        )
      );
  }

  cancelListing(id: string): Observable<void> {
    return this.http
      .post<ApiResponse<{ cancelled: boolean }>>(`${environment.apiBaseUrl}/my-listings/${id}/cancel`, {})
      .pipe(
        map(() => void 0),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo cancelar la publicación.'))
        )
      );
  }
}
