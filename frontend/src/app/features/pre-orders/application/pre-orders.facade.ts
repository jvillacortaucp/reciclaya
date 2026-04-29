import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { PreOrder as LegacyPreOrder } from '../../../core/models/app.models';
import {
  PaymentMethodType,
  PreOrder,
  PreOrderPricingSummary,
  PreOrderScreenState,
  SimulatedPaymentStatus
} from '../models/pre-order.model';
import { PreOrdersHttpRepository } from '../infrastructure/pre-orders-http.repository';

@Injectable({ providedIn: 'root' })
export class PreOrdersFacade {
  private readonly repository = inject(PreOrdersHttpRepository);

  readonly loading = signal(false);
  readonly screenLoading = signal(false);
  readonly summaryLoading = signal(false);
  readonly submitting = signal(false);
  readonly toastMessage = signal<string | null>(null);
  readonly screenError = signal<string | null>(null);
  readonly preOrders = signal<readonly LegacyPreOrder[]>([]);
  readonly screenState = signal<PreOrderScreenState | null>(null);
  readonly economicSummary = signal<PreOrderPricingSummary | null>(null);
  readonly paymentStatus = signal<SimulatedPaymentStatus>('idle');
  readonly createdPreOrder = signal<PreOrder | null>(null);
  readonly downloadingQuotation = signal(false);

  load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudieron cargar las pre-ordenes.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((data) => this.preOrders.set(data));
  }

  loadScreenState(listingId: string): void {
    this.screenLoading.set(true);
    this.screenError.set(null);
    this.screenState.set(null);
    this.economicSummary.set(null);
    this.repository
      .getScreenState(listingId)
      .pipe(
        catchError((error: unknown) => {
          const message = this.resolveScreenErrorMessage(error);
          this.screenError.set(message);
          this.toastMessage.set(message);
          return EMPTY;
        }),
        finalize(() => this.screenLoading.set(false))
      )
      .subscribe((state) => {
        this.screenError.set(null);
        this.screenState.set(state);
        if (state) {
          this.economicSummary.set({
            unitPrice: state.listing.pricePerUnit,
            requestedQuantity: state.defaultRequestedQuantity,
            subtotal: state.listing.pricePerUnit * state.defaultRequestedQuantity,
            serviceFee: Number((state.listing.pricePerUnit * state.defaultRequestedQuantity * state.serviceFeeRate).toFixed(2)),
            total: Number(
              (
                state.listing.pricePerUnit * state.defaultRequestedQuantity +
                state.listing.pricePerUnit * state.defaultRequestedQuantity * state.serviceFeeRate
              ).toFixed(2)
            ),
            currency: state.listing.currency
          });
        }
      });
  }

  clearToastMessage(): void {
    this.toastMessage.set(null);
  }

  simulateSummary(
    listingId: string,
    quantity: number,
    paymentMethod: PaymentMethodType = 'bank_transfer',
    desiredDate = new Date().toISOString().slice(0, 10),
    notes = '',
    reserveStock = true
  ): void {
    const listing = this.screenState()?.listing;
    if (!listing) {
      return;
    }

    this.summaryLoading.set(true);
    this.repository
      .simulatePricing({
        listingId,
        requestedQuantity: quantity,
        unit: listing.unit,
        paymentMethod,
        requestedAt: desiredDate,
        notes,
        reserveStock
      })
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo simular el resumen.'));
          return EMPTY;
        }),
        finalize(() => this.summaryLoading.set(false))
      )
      .subscribe((summary) => this.economicSummary.set(summary));
  }

  submitPreOrder(input: {
    listingId: string;
    requestedQuantity: number;
    unit: string;
    paymentMethod: PaymentMethodType;
    requestedAt: string;
    notes: string;
    reserveStock: boolean;
  }): void {
    this.paymentStatus.set('processing');
    this.submitting.set(true);

    this.repository
      .submit(input)
      .pipe(
        catchError((error: unknown) => {
          this.paymentStatus.set('failed');
          this.toastMessage.set(getErrorMessage(error, 'No se pudo crear la pre-orden.'));
          return EMPTY;
        }),
        finalize(() => this.submitting.set(false))
      )
      .subscribe((result) => {
        this.createdPreOrder.set(result);
        this.paymentStatus.set('success');
        this.toastMessage.set('Pre-orden generada correctamente.');
        this.load();
      });
  }

  resetPaymentState(): void {
    this.paymentStatus.set('idle');
    this.createdPreOrder.set(null);
  }

  downloadQuotationPdf(preOrderId: string): void {
    if (this.downloadingQuotation()) {
      return;
    }

    this.downloadingQuotation.set(true);
    this.repository
      .downloadQuotationPdf(preOrderId)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(this.resolveQuotationErrorMessage(error));
          return EMPTY;
        }),
        finalize(() => this.downloadingQuotation.set(false))
      )
      .subscribe((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `cotizacion-preorden-${preOrderId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
        this.toastMessage.set('Cotizacion descargada correctamente.');
      });
  }

  private resolveScreenErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'No tienes permisos para generar una pre-orden con este producto.';
      }

      if (error.status === 404) {
        return 'No encontramos el residuo solicitado para generar la pre-orden.';
      }
    }

    return getErrorMessage(error, 'No se pudo cargar la información del producto.');
  }

  private resolveQuotationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Inicia sesion para descargar la cotizacion.';
      }

      if (error.status === 403) {
        return 'No tienes permisos para descargar esta cotizacion.';
      }

      if (error.status === 404) {
        return 'No se encontro la pre-orden.';
      }
    }

    return getErrorMessage(error, 'No se pudo generar la cotizacion. Intentalo nuevamente.');
  }
}
