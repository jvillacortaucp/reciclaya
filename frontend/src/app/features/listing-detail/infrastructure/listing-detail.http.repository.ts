import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import { ListingDetailEntity } from '../domain/listing-detail.models';
import { ListingDetailRepository } from '../domain/listing-detail.repository';

@Injectable({ providedIn: 'root' })
export class ListingDetailHttpRepository implements ListingDetailRepository {
  private readonly http = inject(HttpClient);

  getById(id: string): Observable<ListingDetailEntity | null> {
    return this.http
      .get<ApiResponse<ListingDetailEntity>>(`${environment.apiBaseUrl}/marketplace/listings/${id}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => {
          const normalized = normalizeHttpError(error, 'No se pudo cargar el detalle del listado.');
          return normalized.message === 'Listing not found.'
            ? of(null)
            : throwError(() => normalized);
        })
      );
  }
}
