import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { CheckoutOrder, CreateCheckoutFromListingPayload } from '../domain/checkout.models';

@Injectable({ providedIn: 'root' })
export class CheckoutHttpRepository {
  private readonly http = inject(HttpClient);

  createFromListing(listingId: string, payload: CreateCheckoutFromListingPayload): Observable<CheckoutOrder> {
    return this.http
      .post<ApiResponse<CheckoutOrder>>(`${environment.apiBaseUrl}/checkout/from-listing/${listingId}`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo iniciar la compra.')))
      );
  }

  createFromPreOrder(preOrderId: string): Observable<CheckoutOrder> {
    return this.http
      .post<ApiResponse<CheckoutOrder>>(`${environment.apiBaseUrl}/checkout/from-preorder/${preOrderId}`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo iniciar la compra.')))
      );
  }
}
