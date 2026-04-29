import { DeliveryMode, ExchangeType, ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';

export type ListingStatus = 'available' | 'recent' | 'draft' | 'inactive';
export type SortOption = 'newest' | 'best_match' | 'lowest_price' | 'highest_volume';
export type ViewMode = 'grid' | 'list';

export interface ListingMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
}

export interface MarketplaceListing {
  readonly id: string;
  readonly productType: ProductCategory;
  readonly specificResidue: string;
  readonly wasteType: ResidueType;
  readonly sector: SectorType;
  readonly quantity: number;
  readonly unit: 'tons' | 'kg' | 'm3';
  readonly location: string;
  readonly exchangeType: ExchangeType;
  readonly deliveryMode: DeliveryMode;
  readonly immediateAvailability: boolean;
  readonly residueCondition: 'fresh' | 'dry' | 'wet' | 'processed';
  readonly pricePerUnitUsd: number | null;
  readonly status: ListingStatus;
  readonly matchScore: number;
  readonly createdAt: string;
  readonly media: readonly ListingMedia[];
}

export interface MarketplaceFilterState {
  readonly wasteType: ResidueType | 'all';
  readonly sector: SectorType | 'all';
  readonly productType: ProductCategory | 'all';
  readonly specificResidue: string;
  readonly exchangeType: ExchangeType | 'all';
  readonly location: string;
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly deliveryMode: DeliveryMode | 'all';
  readonly immediateOnly: boolean;
  readonly residueCondition: 'fresh' | 'dry' | 'wet' | 'processed' | 'all';
}

export interface SearchState {
  readonly query: string;
  readonly sortBy: SortOption;
  readonly viewMode: ViewMode;
}

export interface RecommendedListing {
  readonly listingId: string;
  readonly reason: string;
  readonly score: number;
}

export interface MarketplaceDataset {
  readonly listings: readonly MarketplaceListing[];
  readonly recommended: readonly RecommendedListing[];
}

export interface MarketplaceListingsQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly filters: MarketplaceFilterState;
  readonly query: string;
  readonly sortBy: SortOption;
}

export interface MarketplaceListingsPage {
  readonly items: readonly MarketplaceListing[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface ActiveFilterChip {
  readonly key: string;
  readonly label: string;
}
