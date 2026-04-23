import { delay, Observable, of } from 'rxjs';
import { inject, Injectable, signal } from '@angular/core';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PreOrder } from '../../../core/models/app.models';
import { PRE_ORDERS_MOCK } from '../../../../assets/mocks/marketplace.mock';

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
}
