import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { MarketplaceListing } from '../marketplace/domain/marketplace.models';

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
}
