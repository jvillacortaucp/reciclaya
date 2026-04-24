import { ExchangeType, ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';

export type MyListingStatus = 'active' | 'draft' | 'inactive';
export type ListingTab = 'active' | 'draft' | 'inactive';

export interface MyListing {
  readonly id: string;
  readonly title: string;
  readonly productType: ProductCategory;
  readonly specificResidue: string;
  readonly residueType: ResidueType;
  readonly sector: SectorType;
  readonly quantity: number;
  readonly unitLabel: string;
  readonly estimatedPriceLabel: string;
  readonly status: MyListingStatus;
  readonly publishedAt: string;
  readonly exchangeType: ExchangeType;
  readonly exchangeLabel: string;
  readonly location?: string;
  readonly imageUrl?: string;
}

export interface MyListingsFilterState {
  readonly residueType: ResidueType | 'all';
  readonly sector: SectorType | 'all';
  readonly productType: ProductCategory | 'all';
  readonly specificResidue: string;
  readonly status: MyListingStatus | 'all';
  readonly exchangeType: ExchangeType | 'all';
  readonly publishedDate: string;
}

export interface MyListingsQuery {
  readonly filters: MyListingsFilterState;
}

export interface ListingCountByStatus {
  readonly active: number;
  readonly draft: number;
  readonly inactive: number;
}

export interface ListingActionFeedback {
  readonly type: 'success' | 'info';
  readonly message: string;
}
