export interface CreateCheckoutFromListingPayload {
  readonly quantity: number;
  readonly reserveStock: boolean;
  readonly notes: string;
}

export interface CheckoutPricing {
  readonly unitPrice: number;
  readonly subtotal: number;
  readonly logisticsFee: number;
  readonly adminFee: number;
  readonly total: number;
  readonly currency: string;
}

export interface CheckoutOrder {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly listingId: string;
  readonly listingTitle: string;
  readonly sellerName: string;
  readonly quantity: number;
  readonly pricing: CheckoutPricing;
  readonly status: string;
}

export interface SimulatePaymentPayload {
  readonly orderId: string;
  readonly paymentMethod: 'card' | 'bank_transfer' | 'yape';
  readonly cardNumber?: string;
  readonly cardHolder?: string;
  readonly expirationMonth?: string;
  readonly expirationYear?: string;
  readonly cvv?: string;
  readonly simulateResult: 'approved' | 'rejected';
}

export interface PaymentResult {
  readonly paymentId: string;
  readonly orderId: string;
  readonly status: string;
  readonly provider: string;
  readonly providerReference: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly cardLast4: string | null;
  readonly cardBrand: string | null;
  readonly paidAt: string | null;
}
