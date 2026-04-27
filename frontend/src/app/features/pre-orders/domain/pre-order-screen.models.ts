import { PaymentMethod } from '../../../core/models/app.models';

export interface ProductSnapshot {
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

export interface EconomicSummary {
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
  readonly logisticsFee: number;
  readonly adminFee: number;
  readonly total: number;
  readonly currency: 'USD' | 'PEN';
}

export interface DraftInfo {
  readonly draftCode: string;
  readonly syncedAtLabel: string;
}

export interface SupportInfo {
  readonly title: string;
  readonly subtitle: string;
}

export interface PreOrderScreenState {
  readonly product: ProductSnapshot;
  readonly paymentMethods: readonly PaymentMethod[];
  readonly reserveHours: number;
  readonly defaultQuantity: number;
  readonly defaultDate: string;
  readonly defaultNotes: string;
  readonly selectedPaymentType: PaymentMethod['type'];
  readonly draft: DraftInfo;
  readonly support: SupportInfo;
  readonly economicSummary?: EconomicSummary;
}

export interface PreOrderRequest {
  readonly listingId: string;
  readonly quantity: number;
  readonly desiredDate: string;
  readonly reserveStock: boolean;
  readonly notes: string;
  readonly paymentMethod: PaymentMethod;
  readonly status?: 'draft' | 'submitted';
}

