import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse, PaymentMethod, PreOrder, PricingSummary } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import {
  EconomicSummary,
  PreOrderRequest,
  PreOrderScreenState,
  ProductSnapshot
} from '../domain/pre-order-screen.models';
import { PreOrdersRepository } from './pre-orders.repository';

interface BackendPreOrderDto {
  readonly id: string;
  readonly listingId: string;
  readonly buyerId: string;
  readonly quantity: number;
  readonly desiredDate?: string | null;
  readonly reserveStock?: boolean;
  readonly notes?: string | null;
  readonly paymentMethod?: PaymentMethod | null;
  readonly status?: string | null;
  readonly pricing?: BackendPricingDto | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly submittedAt?: string | null;
}

interface BackendPricingDto {
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
  readonly logisticsFee: number;
  readonly adminFee?: number;
  readonly total: number;
  readonly currency: 'USD' | 'PEN';
  readonly taxes?: number;
}

interface BackendPreOrderScreenSnapshot {
  readonly listingId: string;
  readonly title: string;
  readonly residueTypeLabel: string;
  readonly sectorLabel: string;
  readonly availabilityLabel: string;
  readonly locationLabel: string;
  readonly providerLabel: string;
  readonly unitPrice: number;
  readonly unitLabel: string;
  readonly totalAvailable: number;
  readonly imageUrl: string;
}

interface BackendPreOrderScreenResponse {
  readonly listing?: BackendPreOrderScreenSnapshot | null;
  readonly product?: BackendPreOrderScreenSnapshot | null;
  readonly defaultQuantity?: number | null;
  readonly availableQuantity?: number | null;
  readonly paymentMethods?: readonly PaymentMethod[] | null;
  readonly economicSummary?: BackendPricingDto | null;
  readonly reserveHours?: number | null;
  readonly defaultDate?: string | null;
  readonly defaultNotes?: string | null;
  readonly selectedPaymentType?: PaymentMethod['type'] | null;
  readonly draft?: {
    readonly draftCode: string;
    readonly syncedAtLabel: string;
  } | null;
  readonly support?: {
    readonly title: string;
    readonly subtitle: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class PreOrdersHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly fallback = inject(PreOrdersRepository);

  list(): Observable<readonly PreOrder[]> {
    return this.http.get<ApiResponse<readonly BackendPreOrderDto[]>>(`${environment.apiBaseUrl}/pre-orders`).pipe(
      map(unwrapApiResponse),
      map((orders) => orders.map((order) => this.toPreOrder(order))),
      catchError((error: unknown) =>
        this.fallbackOnNetworkError(error, 'No se pudieron cargar las pre-ordenes.', () => this.fallback.list())
      )
    );
  }

  create(preOrder: PreOrderRequest): Observable<PreOrder> {
    return this.http
      .post<ApiResponse<BackendPreOrderDto>>(`${environment.apiBaseUrl}/pre-orders`, preOrder)
      .pipe(
        map(unwrapApiResponse),
        map((order) => this.toPreOrder(order)),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudo crear la pre-orden.', () => this.fallback.create(preOrder))
        )
      );
  }

  getScreenState(listingId: string): Observable<PreOrderScreenState | null> {
    return this.http
      .get<ApiResponse<BackendPreOrderScreenResponse>>(`${environment.apiBaseUrl}/pre-orders/new-screen/${listingId}`)
      .pipe(
        map(unwrapApiResponse),
        map((data) => this.toScreenState(data, listingId)),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudo cargar la pantalla de pre-orden.', () =>
            this.fallback.getScreenState(listingId)
          )
        )
      );
  }

  simulateEconomicSummary(request: PreOrderRequest): Observable<EconomicSummary | null> {
    return this.http
      .post<ApiResponse<BackendPricingDto>>(`${environment.apiBaseUrl}/pre-orders/simulate`, request)
      .pipe(
        map(unwrapApiResponse),
        map((pricing) => this.toEconomicSummary(pricing)),
        catchError((error: unknown) =>
          this.fallbackOnNetworkError(error, 'No se pudo simular el resumen.', () =>
            this.fallback.simulateEconomicSummary(request)
          )
        )
      );
  }

  private fallbackOnNetworkError<T>(
    error: unknown,
    fallbackMessage: string,
    fallbackFactory: () => Observable<T>
  ): Observable<T> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return fallbackFactory();
    }

    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }

  private toPreOrder(order: BackendPreOrderDto): PreOrder {
    return {
      id: order.id,
      listingId: order.listingId,
      buyerId: order.buyerId,
      quantity: order.quantity,
      desiredDate: order.desiredDate ?? '',
      status: this.mapStatus(order.status),
      paymentMethod: this.toPaymentMethod(order.paymentMethod),
      pricing: this.toPricing(order.pricing)
    };
  }

  private toScreenState(data: BackendPreOrderScreenResponse, listingId: string): PreOrderScreenState {
    const snapshot = data.product ?? data.listing ?? this.fallbackScreenSnapshot(listingId);
    const economicSummary = data.economicSummary ? this.toEconomicSummary(data.economicSummary) : undefined;

    return {
      product: this.toProductSnapshot(snapshot, listingId),
      paymentMethods: data.paymentMethods ?? this.defaultPaymentMethods(),
      reserveHours: data.reserveHours ?? 48,
      defaultQuantity: data.availableQuantity ?? data.defaultQuantity ?? snapshot.totalAvailable ?? 1,
      defaultDate: data.defaultDate ?? this.defaultDate(),
      defaultNotes: data.defaultNotes ?? '',
      selectedPaymentType: data.selectedPaymentType ?? 'transfer',
      draft: data.draft ?? {
        draftCode: `PRE-${listingId.slice(0, 6).toUpperCase()}`,
        syncedAtLabel: 'Sincronizado recientemente'
      },
      support: data.support ?? {
        title: 'Soporte comercial',
        subtitle: 'Coordina la compra con el proveedor.'
      },
      economicSummary
    };
  }

  private toEconomicSummary(pricing: BackendPricingDto): EconomicSummary {
    return {
      unitPrice: pricing.unitPrice,
      quantity: pricing.quantity,
      subtotal: pricing.subtotal,
      logisticsFee: pricing.logisticsFee,
      adminFee: pricing.adminFee ?? 0,
      total: pricing.total,
      currency: pricing.currency
    };
  }

  private toPricing(pricing?: BackendPricingDto | null): PricingSummary {
    return {
      subtotal: pricing?.subtotal ?? 0,
      logisticsFee: pricing?.logisticsFee ?? 0,
      taxes: pricing?.taxes ?? 0,
      total: pricing?.total ?? 0,
      currency: pricing?.currency ?? 'USD'
    };
  }

  private toPaymentMethod(method?: PaymentMethod | null): PaymentMethod {
    return method ?? { type: 'transfer', label: 'Transferencia' };
  }

  private mapStatus(status?: string | null): PreOrder['status'] {
    switch ((status ?? 'draft').toLowerCase()) {
      case 'submitted':
        return 'submitted';
      case 'approved':
        return 'approved';
      case 'accepted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'draft';
    }
  }

  private toProductSnapshot(snapshot: BackendPreOrderScreenSnapshot, listingId: string): ProductSnapshot {
    return {
      listingId: snapshot.listingId || listingId,
      title: snapshot.title,
      residueTypeLabel: snapshot.residueTypeLabel,
      sectorLabel: snapshot.sectorLabel,
      availabilityLabel: snapshot.availabilityLabel,
      locationLabel: snapshot.locationLabel,
      providerLabel: snapshot.providerLabel,
      unitPrice: snapshot.unitPrice,
      unitLabel: snapshot.unitLabel,
      totalAvailable: snapshot.totalAvailable,
      imageUrl: snapshot.imageUrl
    };
  }

  private fallbackScreenSnapshot(listingId: string): BackendPreOrderScreenSnapshot {
    return {
      listingId,
      title: 'Residuo disponible',
      residueTypeLabel: 'Organico',
      sectorLabel: 'Agroindustry',
      availabilityLabel: 'Disponible hoy',
      locationLabel: 'Lima, Peru',
      providerLabel: 'Proveedor verificado',
      unitPrice: 18.5,
      unitLabel: 'tons',
      totalAvailable: 50,
      imageUrl: ''
    };
  }

  private defaultPaymentMethods(): readonly PaymentMethod[] {
    return [
      { type: 'transfer', label: 'Transferencia' },
      { type: 'cash', label: 'Contraentrega' },
      { type: 'credit', label: 'Tarjeta' }
    ];
  }

  private defaultDate(): string {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
}
