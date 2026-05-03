import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import {
  CheckoutOrder,
  CreateCheckoutFromListingPayload,
  PaymentResult,
  SimulatePaymentPayload
} from '../domain/checkout.models';
import { CheckoutHttpRepository } from '../infrastructure/checkout-http.repository';
import { PaymentsHttpRepository } from '../infrastructure/payments-http.repository';

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly checkoutRepository = inject(CheckoutHttpRepository);
  private readonly paymentsRepository = inject(PaymentsHttpRepository);
  private readonly router = inject(Router);

  readonly createLoading = signal(false);
  readonly paymentLoading = signal(false);
  readonly order = signal<CheckoutOrder | null>(null);
  readonly paymentResult = signal<PaymentResult | null>(null);
  readonly toastMessage = signal<string | null>(null);
  readonly paymentApproved = computed(() => this.paymentResult()?.status === 'approved');

  createFromListing(listingId: string, payload: CreateCheckoutFromListingPayload): void {
    this.createLoading.set(true);
    this.paymentResult.set(null);

    this.checkoutRepository
      .createFromListing(listingId, payload)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo iniciar la compra.'));
          return EMPTY;
        }),
        finalize(() => this.createLoading.set(false))
      )
      .subscribe((order) => this.order.set(order));
  }

  simulatePayment(payload: SimulatePaymentPayload): void {
    this.paymentLoading.set(true);

    this.paymentsRepository
      .simulate(payload)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo procesar el pago.'));
          return EMPTY;
        }),
        finalize(() => this.paymentLoading.set(false))
      )
      .subscribe((result) => {
        this.paymentResult.set(result);
        this.toastMessage.set(result.status === 'approved' ? 'Pago aprobado.' : 'Pago rechazado.');
      });
  }

  goToOrders(): void {
    void this.router.navigateByUrl(APP_ROUTES.orders);
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }

  reset(): void {
    this.createLoading.set(false);
    this.paymentLoading.set(false);
    this.order.set(null);
    this.paymentResult.set(null);
    this.toastMessage.set(null);
  }
}
