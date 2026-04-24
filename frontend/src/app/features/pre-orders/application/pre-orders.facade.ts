import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PreOrder } from '../../../core/models/app.models';
import { EconomicSummary, PreOrderScreenState } from '../domain/pre-order-screen.models';
import { PreOrdersRepository } from '../infrastructure/pre-orders.repository';

@Injectable({ providedIn: 'root' })
export class PreOrdersFacade {
  private readonly repository = inject(PreOrdersRepository);

  readonly loading = signal(false);
  readonly screenLoading = signal(false);
  readonly summaryLoading = signal(false);
  readonly preOrders = signal<readonly PreOrder[]>([]);
  readonly screenState = signal<PreOrderScreenState | null>(null);
  readonly economicSummary = signal<EconomicSummary | null>(null);

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
          this.simulateSummary(listingId, state.defaultQuantity, true);
        }
      });
  }

  simulateSummary(listingId: string, quantity: number, reserveSelected: boolean): void {
    this.summaryLoading.set(true);
    this.repository
      .simulateEconomicSummary(listingId, quantity, reserveSelected)
      .pipe(finalize(() => this.summaryLoading.set(false)))
      .subscribe((summary) => this.economicSummary.set(summary));
  }
}
