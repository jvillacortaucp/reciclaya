export interface CommercialRequestItem {
  readonly id: string;
  readonly listingId: string;
  readonly listingTitle: string;
  readonly buyerId: string;
  readonly buyerName: string;
  readonly sellerId: string;
  readonly sellerName: string;
  readonly message: string | null;
  readonly status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  readonly createdAt: string;
}

export interface CreateCommercialRequestPayload {
  readonly listingId: string;
  readonly message: string;
}
