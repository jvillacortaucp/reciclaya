import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { PaymentResult, SimulatePaymentPayload } from '../domain/checkout.models';

@Injectable({ providedIn: 'root' })
export class PaymentsHttpRepository {
  private readonly http = inject(HttpClient);

  simulate(payload: SimulatePaymentPayload): Observable<PaymentResult> {
    return this.http
      .post<ApiResponse<PaymentResult>>(`${environment.apiBaseUrl}/payments/simulate`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo procesar el pago.')))
      );
  }
}
