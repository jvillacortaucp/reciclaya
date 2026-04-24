import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { PreOrder } from '../../../core/models/app.models';
import {
  EconomicSummary,
  PreOrderRequest,
  PreOrderScreenState
} from '../domain/pre-order-screen.models';
import { PreOrdersHttpRepository } from '../infrastructure/pre-orders-http.repository';

@Injectable({ providedIn: 'root' })
export class PreOrdersFacade {
  private readonly repository = inject(PreOrdersHttpRepository);

  readonly loading = signal(false);
  readonly screenLoading = signal(false);
  readonly summaryLoading = signal(false);
  readonly preOrders = signal<readonly PreOrder[]>([]);
  readonly screenState = signal<PreOrderScreenState | null>(null);
  readonly economicSummary = signal<EconomicSummary | null>(null);
  readonly toastMessage = signal<string | null>(null);

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

  create(preOrder: PreOrderRequest): void {
    this.loading.set(true);
    this.repository
      .create(preOrder)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo crear la pre-orden.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(() => {
        this.toastMessage.set(
          preOrder.status === 'submitted'
            ? 'Pre-orden enviada correctamente.'
            : 'Borrador guardado correctamente.'
        );
        this.load();
      });
  }

  loadScreenState(listingId: string): void {
    this.screenLoading.set(true);
    this.repository
      .getScreenState(listingId)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo cargar la pre-orden.'));
          return EMPTY;
        }),
        finalize(() => this.screenLoading.set(false))
      )
      .subscribe((state) => {
        this.screenState.set(state);
        if (state) {
          this.economicSummary.set(state.economicSummary ?? null);
          if (!state.economicSummary) {
            this.simulateSummary({
              listingId,
              quantity: state.defaultQuantity,
              desiredDate: state.defaultDate,
              reserveStock: true,
              notes: state.defaultNotes,
              paymentMethod: {
                type: state.selectedPaymentType,
                label: state.paymentMethods.find((method) => method.type === state.selectedPaymentType)?.label ?? state.selectedPaymentType
              }
            });
          }
        }
      });
  }

  simulateSummary(request: PreOrderRequest): void {
    this.summaryLoading.set(true);
    this.repository
      .simulateEconomicSummary(request)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo simular el resumen.'));
          return EMPTY;
        }),
        finalize(() => this.summaryLoading.set(false))
      )
      .subscribe((summary) => this.economicSummary.set(summary));
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }
}
