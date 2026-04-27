import { delay, Observable, of } from 'rxjs';
import { inject, Injectable, signal } from '@angular/core';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PreOrder as LegacyPreOrder } from '../../../core/models/app.models';
import { PRE_ORDERS_MOCK } from '../../../../assets/mocks/marketplace.mock';
import { PRE_ORDER_SCREEN_MOCK } from '../data/pre-order.mock';
import { PreOrder, PreOrderPricingSummary, PreOrderScreenState } from '../models/pre-order.model';

@Injectable({ providedIn: 'root' })
export class PreOrdersRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly legacyPreOrders = signal<readonly LegacyPreOrder[]>(PRE_ORDERS_MOCK);
  private readonly submittedPreOrders = signal<readonly PreOrder[]>([]);

  list(): Observable<readonly LegacyPreOrder[]> {
    return of(this.legacyPreOrders()).pipe(delay(this.latency));
  }

  create(preOrder: LegacyPreOrder): Observable<LegacyPreOrder> {
    this.legacyPreOrders.update((current) => [preOrder, ...current]);
    return of(preOrder).pipe(delay(this.latency));
  }

  getScreenState(listingId: string): Observable<PreOrderScreenState | null> {
    return of(PRE_ORDER_SCREEN_MOCK[listingId] ?? null).pipe(delay(this.latency));
  }

  simulatePricing(
    listingId: string,
    requestedQuantity: number
  ): Observable<PreOrderPricingSummary | null> {
    const state = PRE_ORDER_SCREEN_MOCK[listingId];
    if (!state) {
      return of(null).pipe(delay(this.latency));
    }

    const safeQuantity = Math.max(1, Math.min(requestedQuantity, state.listing.availableQuantity));
    const unitPrice = state.listing.pricePerUnit;
    const subtotal = unitPrice * safeQuantity;
    const serviceFee = Number((subtotal * state.serviceFeeRate).toFixed(2));
    const total = Number((subtotal + serviceFee).toFixed(2));

    const summary: PreOrderPricingSummary = {
      unitPrice,
      requestedQuantity: safeQuantity,
      subtotal,
      serviceFee,
      total,
      currency: state.listing.currency
    };

    return of(summary).pipe(delay(Math.round(this.latency * 0.75)));
  }

  submitSimulatedPreOrder(preOrder: PreOrder): Observable<PreOrder> {
    this.submittedPreOrders.update((current) => [preOrder, ...current]);
    return of(preOrder).pipe(delay(Math.round(this.latency * 1.2)));
  }
}
