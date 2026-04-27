export interface MessageThreadListItem {
  readonly id: string;
  readonly commercialRequestId: string | null;
  readonly listingId: string;
  readonly listingTitle: string;
  readonly buyerName: string;
  readonly sellerName: string;
  readonly lastMessagePreview: string;
  readonly lastMessageAt: string | null;
  readonly unreadCount: number;
  readonly status: 'active' | 'closed' | 'archived';
}

export interface MessageThreadListing {
  readonly id: string;
  readonly title: string;
  readonly quantity: number;
  readonly unit: string;
}

export interface MessageItem {
  readonly id: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly body: string;
  readonly createdAt: string;
  readonly readAt: string | null;
  readonly isMine: boolean;
}

export interface MessageThreadDetail {
  readonly id: string;
  readonly commercialRequestId: string | null;
  readonly listing: MessageThreadListing;
  readonly buyerName: string;
  readonly sellerName: string;
  readonly status: 'active' | 'closed' | 'archived';
  readonly messages: readonly MessageItem[];
}

export interface CreateMessagePayload {
  readonly body: string;
}

export interface MarkThreadReadResult {
  readonly threadId: string;
  readonly updatedCount: number;
}
