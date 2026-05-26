import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { RegulationHttpService } from '../../../core/regulatory/regulation-http.service';
import { ListingDetailHttpRepository } from '../../listing-detail/infrastructure/listing-detail.http.repository';
import { CheckoutOrder, CreateCheckoutFromListingPayload } from '../domain/checkout.models';

@Injectable({ providedIn: 'root' })
export class CheckoutHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly regulationHttpService = inject(RegulationHttpService);
  private readonly listingDetailRepository = inject(ListingDetailHttpRepository);

  createFromListing(listingId: string, payload: CreateCheckoutFromListingPayload): Observable<CheckoutOrder> {
    return this.listingDetailRepository
      .getById(listingId)
      .pipe(
        switchMap((listing) =>
          this.regulationHttpService.validateOperation({
            action: 'confirm_purchase',
            actor: 'buyer',
            residueType: listing?.wasteType ?? null,
            sector: listing?.sector ?? null,
            productType: listing?.productType ?? null,
            specificResidue: listing?.specificResidueType ?? null,
            quantity: listing?.volume.amount ?? null,
            unit: listing?.volume.unit ?? null
          })
        ),
        switchMap((validation) => {
          if (!validation.allowed) {
            throw new Error(validation.blockingMessage || validation.upgradeCallToAction || 'No cumples el nivel regulatorio requerido.');
          }

          return this.http.post<ApiResponse<CheckoutOrder>>(`${environment.apiBaseUrl}/checkout/from-listing/${listingId}`, payload);
        }),
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
