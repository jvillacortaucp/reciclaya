export interface OrderListItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly listingId: string;
  readonly listingTitle: string;
  readonly buyerName: string;
  readonly sellerName: string;
  readonly quantity: number;
  readonly total: number;
  readonly currency: string;
  readonly status: string;
  readonly createdAt: string;
  readonly paidAt: string | null;
}

export interface OrderPaymentSummary {
  readonly id: string;
  readonly provider: string;
  readonly providerReference: string | null;
  readonly status: string;
  readonly paymentMethod: string;
  readonly amount: number;
  readonly currency: string;
  readonly cardLast4: string | null;
  readonly cardBrand: string | null;
  readonly failureReason: string | null;
  readonly createdAt: string;
  readonly paidAt: string | null;
}

export interface OrderDetail extends OrderListItem {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly preOrderId: string | null;
  readonly paymentTransactionId: string | null;
  readonly updatedAt: string;
  readonly pricing: {
    readonly unitPrice: number;
    readonly subtotal: number;
    readonly logisticsFee: number;
    readonly adminFee: number;
    readonly total: number;
    readonly currency: string;
  };
  readonly payments: readonly OrderPaymentSummary[];
}
