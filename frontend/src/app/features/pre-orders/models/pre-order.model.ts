export type PaymentMethodType =
  | 'card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'cash_on_delivery'
  | 'seller_agreement';

export type SimulatedPaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export type PreOrderStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected';

export interface SellerInfo {
  readonly id: string;
  readonly name: string;
  readonly sellerType: 'company' | 'natural_person';
  readonly contactName: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly verified: boolean;
}

export interface PreOrderListing {
  readonly id: string;
  readonly title: string;
  readonly productType: string;
  readonly specificResidue: string;
  readonly wasteType: 'organic' | 'inorganic';
  readonly sector: string;
  readonly availableQuantity: number;
  readonly unit: string;
  readonly pricePerUnit: number;
  readonly currency: 'PEN' | 'USD';
  readonly exchangeType: 'sale' | 'barter' | 'pickup';
  readonly deliveryMode: string;
  readonly location: string;
  readonly imageUrl?: string;
  readonly seller: SellerInfo;
}

export interface PaymentMethod {
  readonly id: PaymentMethodType;
  readonly label: string;
  readonly description: string;
  readonly iconName: string;
  readonly enabled: boolean;
}

export interface SimulatedPaymentCard {
  readonly id: string;
  readonly holderName: string;
  readonly cardNumber: string;
  readonly expiryDate: string;
  readonly cvv: string;
  readonly brand: 'visa' | 'mastercard' | 'amex' | 'generic';
  readonly lastFour: string;
}

export interface PreOrderPricingSummary {
  readonly unitPrice: number;
  readonly requestedQuantity: number;
  readonly subtotal: number;
  readonly serviceFee: number;
  readonly total: number;
  readonly currency: 'PEN' | 'USD';
}

export interface PreOrder {
  readonly id: string;
  readonly listingId: string;
  readonly requestedQuantity: number;
  readonly unit: string;
  readonly paymentMethod: PaymentMethodType;
  readonly pricing: PreOrderPricingSummary;
  readonly status: PreOrderStatus;
  readonly createdAt: string;
  readonly requestedAt: string;
  readonly notes: string;
  readonly reserveStock: boolean;
}

export interface PreOrderScreenState {
  readonly listing: PreOrderListing;
  readonly paymentMethods: readonly PaymentMethod[];
  readonly defaultRequestedQuantity: number;
  readonly defaultPickupDate: string;
  readonly defaultNotes: string;
  readonly reserveHours: number;
  readonly serviceFeeRate: number;
}
