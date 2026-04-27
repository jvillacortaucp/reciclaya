import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PreOrder } from '../../../core/models/app.models';
import {
  PaymentMethodType,
  PreOrder as CheckoutPreOrder,
  PreOrderPricingSummary,
  PreOrderScreenState,
  SimulatedPaymentStatus
} from '../models/pre-order.model';
import { PreOrdersRepository } from '../infrastructure/pre-orders.repository';

@Injectable({ providedIn: 'root' })
export class PreOrdersFacade {
  private readonly repository = inject(PreOrdersRepository);

  readonly loading = signal(false);
  readonly screenLoading = signal(false);
  readonly summaryLoading = signal(false);
  readonly submitting = signal(false);
  readonly preOrders = signal<readonly PreOrder[]>([]);
  readonly screenState = signal<PreOrderScreenState | null>(null);
  readonly economicSummary = signal<PreOrderPricingSummary | null>(null);
  readonly paymentStatus = signal<SimulatedPaymentStatus>('idle');
  readonly createdPreOrder = signal<CheckoutPreOrder | null>(null);

  load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.preOrders.set(data));
  }

  create(preOrder: PreOrder): void {
    this.loading.set(true);
    this.repository
      .create(preOrder)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.load());
  }

  loadScreenState(listingId: string): void {
    this.screenLoading.set(true);
    this.repository
      .getScreenState(listingId)
      .pipe(finalize(() => this.screenLoading.set(false)))
      .subscribe((state) => {
        this.screenState.set(state);
        if (state) {
          this.simulateSummary(listingId, state.defaultRequestedQuantity);
        }
      });
  }

  simulateSummary(listingId: string, quantity: number): void {
    this.summaryLoading.set(true);
    this.repository
      .simulatePricing(listingId, quantity)
      .pipe(finalize(() => this.summaryLoading.set(false)))
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
    const summary = this.economicSummary();
    if (!summary) {
      return;
    }

    this.paymentStatus.set('processing');
    this.submitting.set(true);

    const preOrder: CheckoutPreOrder = {
      id: `pre-${Date.now()}`,
      listingId: input.listingId,
      requestedQuantity: input.requestedQuantity,
      unit: input.unit,
      paymentMethod: input.paymentMethod,
      pricing: summary,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      requestedAt: input.requestedAt,
      notes: input.notes,
      reserveStock: input.reserveStock
    };

    this.repository
      .submitSimulatedPreOrder(preOrder)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (result) => {
          this.createdPreOrder.set(result);
          this.paymentStatus.set('success');
        },
        error: () => {
          this.paymentStatus.set('failed');
        }
      });
  }

  resetPaymentState(): void {
    this.paymentStatus.set('idle');
    this.createdPreOrder.set(null);
  }
}
