import { delay, Observable, of } from 'rxjs';
import { inject, Injectable, signal } from '@angular/core';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PreOrder } from '../../../core/models/app.models';
import { PRE_ORDERS_MOCK } from '../../../../assets/mocks/marketplace.mock';
import { PRE_ORDER_SCREEN_MOCK } from '../../../../assets/mocks/pre-order-screen.mock';
import { EconomicSummary, PreOrderScreenState } from '../domain/pre-order-screen.models';

@Injectable({ providedIn: 'root' })
export class PreOrdersRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly preOrders = signal<readonly PreOrder[]>(PRE_ORDERS_MOCK);

  list(): Observable<readonly PreOrder[]> {
    return of(this.preOrders()).pipe(delay(this.latency));
  }

  create(preOrder: PreOrder): Observable<PreOrder> {
    this.preOrders.update((current) => [preOrder, ...current]);
    return of(preOrder).pipe(delay(this.latency));
  }

  getScreenState(listingId: string): Observable<PreOrderScreenState | null> {
    return of(PRE_ORDER_SCREEN_MOCK[listingId] ?? null).pipe(delay(this.latency));
  }

  simulateEconomicSummary(
    listingId: string,
    quantity: number,
    reserveSelected: boolean
  ): Observable<EconomicSummary | null> {
    const state = PRE_ORDER_SCREEN_MOCK[listingId];
    if (!state) {
      return of(null).pipe(delay(this.latency));
    }

    const unitPrice = state.product.unitPrice;
    const subtotal = quantity * unitPrice;
    const logisticsFee = reserveSelected ? 24 : 32;
    const adminFee = 0;
    const total = subtotal + logisticsFee + adminFee;
    const summary: EconomicSummary = {
      unitPrice,
      quantity,
      subtotal,
      logisticsFee,
      adminFee,
      total,
      currency: 'USD'
    };

    return of(summary).pipe(delay(Math.round(this.latency * 0.75)));
  }
}
