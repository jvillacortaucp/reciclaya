import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PaymentMethod, PreOrder, PricingSummary } from '../../../core/models/app.models';
import {
  EconomicSummary,
  PreOrderRequest,
  PreOrderScreenState,
  ProductSnapshot
} from '../domain/pre-order-screen.models';

const PRE_ORDERS_STORAGE_KEY = 'reciclaya.pre-orders.mock';

const MOCK_PAYMENT_METHODS: readonly PaymentMethod[] = [
  { type: 'transfer', label: 'Transferencia' },
  { type: 'cash', label: 'Contraentrega' },
  { type: 'credit', label: 'Tarjeta' }
];

@Injectable({ providedIn: 'root' })
export class PreOrdersRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  list(): Observable<readonly PreOrder[]> {
    return of(this.readOrders()).pipe(delay(this.latency));
  }

  create(preOrder: PreOrderRequest): Observable<PreOrder> {
    const nextOrder = this.toPreOrder(preOrder, preOrder.status ?? 'draft');
    const nextOrders = [nextOrder, ...this.readOrders().filter((item) => item.id !== nextOrder.id)];
    this.writeOrders(nextOrders);

    return of(nextOrder).pipe(delay(this.latency));
  }

  getScreenState(listingId: string): Observable<PreOrderScreenState | null> {
    return of(this.buildScreenState(listingId)).pipe(delay(this.latency));
  }

  simulateEconomicSummary(request: PreOrderRequest): Observable<EconomicSummary | null> {
    return of(this.buildEconomicSummary(request)).pipe(delay(Math.max(150, Math.round(this.latency / 2))));
  }

  private readOrders(): PreOrder[] {
    const raw = localStorage.getItem(PRE_ORDERS_STORAGE_KEY);
    if (!raw) {
      return [this.toPreOrder(this.buildSeedRequest(), 'submitted')];
    }

    try {
      return JSON.parse(raw) as PreOrder[];
    } catch {
      return [this.toPreOrder(this.buildSeedRequest(), 'submitted')];
    }
  }

  private writeOrders(orders: readonly PreOrder[]): void {
    localStorage.setItem(PRE_ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  private buildScreenState(listingId: string): PreOrderScreenState {
    const request = {
      listingId,
      quantity: 10,
      desiredDate: this.toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      reserveStock: true,
      notes: 'Deseo coordinar recojo',
      paymentMethod: MOCK_PAYMENT_METHODS[0]
    };

    const product: ProductSnapshot = {
      listingId,
      title: 'Cascara de mango fresca',
      residueTypeLabel: 'Organico',
      sectorLabel: 'Agroindustry',
      availabilityLabel: 'Disponible hoy',
      locationLabel: 'Lima, Peru',
      providerLabel: 'Agroloop SAC',
      unitPrice: 18.5,
      unitLabel: 'tons',
      totalAvailable: 120,
      imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=900&q=80'
    };

    return {
      product,
      paymentMethods: MOCK_PAYMENT_METHODS,
      reserveHours: 48,
      defaultQuantity: 10,
      defaultDate: this.toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      defaultNotes: 'Deseo coordinar recojo',
      selectedPaymentType: 'transfer',
      draft: {
        draftCode: `DRAFT-${listingId.slice(0, 6).toUpperCase()}`,
        syncedAtLabel: 'Guardado hace unos segundos'
      },
      support: {
        title: 'Soporte comercial',
        subtitle: 'Te ayudamos a coordinar la compra y el retiro.'
      },
      economicSummary: this.buildEconomicSummary(request)
    };
  }

  private buildSeedRequest(): PreOrderRequest {
    return {
      listingId: 'mock-listing-001',
      quantity: 10,
      desiredDate: this.toDateInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      reserveStock: true,
      notes: 'Deseo coordinar recojo',
      paymentMethod: MOCK_PAYMENT_METHODS[0],
      status: 'submitted'
    };
  }

  private buildEconomicSummary(request: PreOrderRequest): EconomicSummary {
    const unitPrice = 18.5;
    const subtotal = Number((request.quantity * unitPrice).toFixed(2));
    const logisticsFee = request.reserveStock ? 24 : 32;
    const adminFee = 0;
    const total = Number((subtotal + logisticsFee + adminFee).toFixed(2));

    return {
      unitPrice,
      quantity: request.quantity,
      subtotal,
      logisticsFee,
      adminFee,
      total,
      currency: 'USD'
    };
  }

  private buildPricingSummary(request: PreOrderRequest): PricingSummary {
    const unitPrice = 18.5;
    const subtotal = Number((request.quantity * unitPrice).toFixed(2));
    const logisticsFee = request.reserveStock ? 24 : 32;
    const taxes = 0;
    const total = Number((subtotal + logisticsFee + taxes).toFixed(2));

    return {
      subtotal,
      logisticsFee,
      total,
      currency: 'USD',
      taxes
    };
  }

  private toPreOrder(request: PreOrderRequest, status: PreOrder['status']): PreOrder {
    const pricing = this.buildPricingSummary(request);

    return {
      id: request.listingId ? `po-${request.listingId}-${request.quantity}` : `po-${Date.now()}`,
      listingId: request.listingId,
      buyerId: 'buyer-mock',
      quantity: request.quantity,
      desiredDate: request.desiredDate,
      status,
      paymentMethod: request.paymentMethod,
      pricing
    };
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
