import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse, PreOrder as LegacyPreOrder } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import {
  PaymentMethod,
  PaymentMethodType,
  PreOrder,
  PreOrderPricingSummary,
  PreOrderScreenState
} from '../models/pre-order.model';

interface BackendPreOrderPaymentMethod {
  readonly type: string;
  readonly label: string;
}

interface BackendPricingDto {
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
  readonly logisticsFee: number;
  readonly adminFee?: number;
  readonly total: number;
  readonly currency: 'USD' | 'PEN';
}

interface BackendPreOrderDto {
  readonly id: string;
  readonly listingId: string;
  readonly quantity: number;
  readonly desiredDate?: string | null;
  readonly reserveStock?: boolean;
  readonly notes?: string | null;
  readonly paymentMethod?: BackendPreOrderPaymentMethod | null;
  readonly status?: string | null;
  readonly pricing?: BackendPricingDto | null;
  readonly createdAt?: string | null;
}

interface BackendPreOrderScreenListingDto {
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

interface BackendPreOrderNewScreenDto {
  readonly listing: BackendPreOrderScreenListingDto;
  readonly defaultQuantity: number;
  readonly paymentMethods: readonly BackendPreOrderPaymentMethod[];
  readonly economicSummary: BackendPricingDto;
  readonly reserveHours: number;
  readonly defaultDate: string;
  readonly defaultNotes: string;
}

interface CreatePreOrderPayload {
  readonly listingId: string;
  readonly requestedQuantity: number;
  readonly unit: string;
  readonly paymentMethod: PaymentMethodType;
  readonly requestedAt: string;
  readonly notes: string;
  readonly reserveStock: boolean;
}

@Injectable({ providedIn: 'root' })
export class PreOrdersHttpRepository {
  private readonly http = inject(HttpClient);

  list(): Observable<readonly LegacyPreOrder[]> {
    return this.http.get<ApiResponse<readonly BackendPreOrderDto[]>>(`${environment.apiBaseUrl}/pre-orders`).pipe(
      map(unwrapApiResponse),
      map((orders) => orders.map((order) => this.toLegacyPreOrder(order))),
      catchError((error: unknown) => this.handleHttpError(error, 'No se pudieron cargar las pre-ordenes.'))
    );
  }

  getScreenState(listingId: string): Observable<PreOrderScreenState | null> {
    return this.http
      .get<ApiResponse<BackendPreOrderNewScreenDto>>(`${environment.apiBaseUrl}/pre-orders/new-screen/${listingId}`)
      .pipe(
        map(unwrapApiResponse),
        map((response) => this.toScreenState(response)),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo cargar la pantalla de pre-orden.'))
      );
  }

  simulatePricing(input: CreatePreOrderPayload): Observable<PreOrderPricingSummary | null> {
    return this.http
      .post<ApiResponse<BackendPricingDto>>(`${environment.apiBaseUrl}/pre-orders/simulate`, this.toBackendPayload(input))
      .pipe(
        map(unwrapApiResponse),
        map((pricing) => this.toPricingSummary(pricing)),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo simular el resumen.'))
      );
  }

  submit(input: CreatePreOrderPayload): Observable<PreOrder> {
    return this.http
      .post<ApiResponse<BackendPreOrderDto>>(`${environment.apiBaseUrl}/pre-orders`, this.toBackendPayload(input))
      .pipe(
        map(unwrapApiResponse),
        map((response) => this.toUiPreOrder(response, input.unit)),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo crear la pre-orden.'))
      );
  }

  private toLegacyPreOrder(order: BackendPreOrderDto): LegacyPreOrder {
    return {
      id: order.id,
      listingId: order.listingId,
      buyerId: 'current-user',
      quantity: order.quantity,
      desiredDate: order.desiredDate ?? '',
      status: this.toLegacyStatus(order.status),
      paymentMethod: {
        type: this.toLegacyPaymentType(order.paymentMethod?.type),
        label: order.paymentMethod?.label ?? 'Transferencia'
      },
      pricing: {
        subtotal: order.pricing?.subtotal ?? 0,
        logisticsFee: order.pricing?.logisticsFee ?? 0,
        taxes: order.pricing?.adminFee ?? 0,
        total: order.pricing?.total ?? 0,
        currency: order.pricing?.currency ?? 'PEN'
      }
    };
  }

  private toScreenState(data: BackendPreOrderNewScreenDto): PreOrderScreenState {
    return {
      listing: {
        id: data.listing.listingId,
        title: data.listing.title,
        productType: data.listing.residueTypeLabel,
        specificResidue: data.listing.title,
        wasteType: 'organic',
        sector: data.listing.sectorLabel.toLowerCase() as PreOrderScreenState['listing']['sector'],
        availableQuantity: data.listing.totalAvailable,
        unit: data.listing.unitLabel,
        pricePerUnit: data.listing.unitPrice,
        currency: data.economicSummary.currency,
        exchangeType: 'sale',
        deliveryMode: 'delivery',
        location: data.listing.locationLabel,
        imageUrl: data.listing.imageUrl,
        seller: {
          id: 'seller',
          name: data.listing.providerLabel,
          sellerType: 'company',
          contactName: data.listing.providerLabel,
          phone: '',
          email: '',
          address: data.listing.locationLabel,
          verified: true
        }
      },
      paymentMethods: data.paymentMethods.map((method) => this.toUiPaymentMethod(method)),
      defaultRequestedQuantity: data.defaultQuantity,
      defaultPickupDate: data.defaultDate,
      defaultNotes: data.defaultNotes,
      reserveHours: data.reserveHours,
      serviceFeeRate: data.economicSummary.subtotal > 0
        ? Number(((data.economicSummary.adminFee ?? 0) / data.economicSummary.subtotal).toFixed(4))
        : 0
    };
  }

  private toPricingSummary(pricing: BackendPricingDto): PreOrderPricingSummary {
    return {
      unitPrice: pricing.unitPrice,
      requestedQuantity: pricing.quantity,
      subtotal: pricing.subtotal,
      serviceFee: pricing.adminFee ?? 0,
      total: pricing.total,
      currency: pricing.currency
    };
  }

  private toUiPreOrder(order: BackendPreOrderDto, unit: string): PreOrder {
    return {
      id: order.id,
      listingId: order.listingId,
      requestedQuantity: order.quantity,
      unit,
      paymentMethod: this.toUiPaymentType(order.paymentMethod?.type),
      pricing: this.toPricingSummary(
        order.pricing ?? {
          unitPrice: 0,
          quantity: order.quantity,
          subtotal: 0,
          logisticsFee: 0,
          adminFee: 0,
          total: 0,
          currency: 'PEN'
        }
      ),
      status: this.toUiStatus(order.status),
      createdAt: order.createdAt ?? new Date().toISOString(),
      requestedAt: order.desiredDate ?? new Date().toISOString().slice(0, 10),
      notes: order.notes ?? '',
      reserveStock: order.reserveStock ?? false
    };
  }

  private toBackendPayload(input: CreatePreOrderPayload) {
    return {
      listingId: input.listingId,
      quantity: input.requestedQuantity,
      desiredDate: input.requestedAt,
      reserveStock: input.reserveStock,
      notes: input.notes,
      paymentMethod: {
        type: this.toBackendPaymentType(input.paymentMethod),
        label: this.paymentLabel(input.paymentMethod)
      },
      status: 'submitted'
    };
  }

  private toUiPaymentMethod(method: BackendPreOrderPaymentMethod): PaymentMethod {
    const type = this.toUiPaymentType(method.type);
    return {
      id: type,
      label: method.label,
      description: `Paga usando ${method.label.toLowerCase()}.`,
      iconName: this.iconName(type),
      enabled: true
    };
  }

  private toUiPaymentType(type?: string | null): PaymentMethodType {
    switch ((type ?? '').toLowerCase()) {
      case 'credit':
      case 'card':
        return 'card';
      case 'cash':
        return 'cash_on_delivery';
      case 'yape':
      case 'wallet':
      case 'digital_wallet':
        return 'digital_wallet';
      case 'seller_agreement':
        return 'seller_agreement';
      default:
        return 'bank_transfer';
    }
  }

  private toBackendPaymentType(type: PaymentMethodType): string {
    switch (type) {
      case 'card':
        return 'credit';
      case 'cash_on_delivery':
        return 'cash';
      case 'digital_wallet':
        return 'yape';
      case 'seller_agreement':
        return 'seller_agreement';
      default:
        return 'transfer';
    }
  }

  private paymentLabel(type: PaymentMethodType): string {
    switch (type) {
      case 'card':
        return 'Tarjeta';
      case 'cash_on_delivery':
        return 'Contraentrega';
      case 'digital_wallet':
        return 'Yape';
      case 'seller_agreement':
        return 'Acuerdo con proveedor';
      default:
        return 'Transferencia';
    }
  }

  private iconName(type: PaymentMethodType): PaymentMethod['iconName'] {
    switch (type) {
      case 'card':
        return 'credit-card';
      case 'digital_wallet':
        return 'qr-code';
      case 'cash_on_delivery':
        return 'handshake';
      case 'seller_agreement':
        return 'file-text';
      default:
        return 'landmark';
    }
  }

  private toUiStatus(status?: string | null): PreOrder['status'] {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending_approval':
        return 'pending_approval';
      default:
        return 'submitted';
    }
  }

  private toLegacyStatus(status?: string | null): LegacyPreOrder['status'] {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return 'approved';
      case 'accepted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'submitted';
    }
  }

  private toLegacyPaymentType(type?: string | null): LegacyPreOrder['paymentMethod']['type'] {
    switch ((type ?? '').toLowerCase()) {
      case 'credit':
      case 'card':
        return 'credit';
      case 'cash':
        return 'cash';
      default:
        return 'transfer';
    }
  }

  private handleHttpError(error: unknown, fallbackMessage: string): Observable<never> {
    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }
}
