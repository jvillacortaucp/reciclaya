import { delay, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { ListingDetail, WasteListing } from '../../../core/models/app.models';
import { LISTING_DETAIL_MOCK, WASTE_LISTINGS_MOCK } from '../../../../assets/mocks/marketplace.mock';
import { MARKETPLACE_DATASET_MOCK } from '../../../../assets/mocks/marketplace-screen.mock';
import {
  MarketplaceDataset,
  MarketplaceFilterState,
  MarketplaceListing,
  MarketplaceListingsPage,
  MarketplaceListingsQuery,
  SortOption
} from '../domain/marketplace.models';

@Injectable({ providedIn: 'root' })
export class MarketplaceRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  getDataset(): Observable<MarketplaceDataset> {
    return of(MARKETPLACE_DATASET_MOCK).pipe(delay(this.latency));
  }

  getListings(query: MarketplaceListingsQuery): Observable<MarketplaceListingsPage> {
    const filtered = this.sortListings(
      MARKETPLACE_DATASET_MOCK.listings.filter((listing) => this.matchesListing(listing, query)),
      query.sortBy
    );

    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    const items = filtered.slice(start, end);
    const hasMore = end < filtered.length;

    return of({
      items,
      total: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
      hasMore
    }).pipe(delay(this.latency + 220));
  }

  list(): Observable<readonly WasteListing[]> {
    return of(WASTE_LISTINGS_MOCK).pipe(delay(this.latency));
  }

  detail(id: string): Observable<ListingDetail | null> {
    return of(LISTING_DETAIL_MOCK[id] ?? null).pipe(delay(this.latency));
  }

  private matchesListing(listing: MarketplaceListing, query: MarketplaceListingsQuery): boolean {
    const text = query.query.toLowerCase().trim();
    const filters = query.filters;

    const textMatch =
      !text ||
      listing.specificResidue.toLowerCase().includes(text) ||
      listing.location.toLowerCase().includes(text) ||
      listing.sector.toLowerCase().includes(text) ||
      listing.productType.toLowerCase().includes(text);

    const wasteTypeMatch = filters.wasteType === 'all' || listing.wasteType === filters.wasteType;
    const sectorMatch = filters.sector === 'all' || listing.sector === filters.sector;
    const productMatch = filters.productType === 'all' || listing.productType === filters.productType;
    const residueMatch =
      !filters.specificResidue ||
      listing.specificResidue.toLowerCase().includes(filters.specificResidue.toLowerCase());
    const exchangeMatch = filters.exchangeType === 'all' || listing.exchangeType === filters.exchangeType;
    const locationMatch = !filters.location || listing.location.toLowerCase().includes(filters.location.toLowerCase());
    const deliveryMatch = filters.deliveryMode === 'all' || listing.deliveryMode === filters.deliveryMode;
    const immediateMatch = !filters.immediateOnly || listing.immediateAvailability;
    const conditionMatch = filters.residueCondition === 'all' || listing.residueCondition === filters.residueCondition;
    const minPriceMatch = filters.minPrice === null || (listing.pricePerUnitUsd ?? 0) >= filters.minPrice;
    const maxPriceMatch = filters.maxPrice === null || (listing.pricePerUnitUsd ?? 0) <= filters.maxPrice;

    return (
      textMatch &&
      wasteTypeMatch &&
      sectorMatch &&
      productMatch &&
      residueMatch &&
      exchangeMatch &&
      locationMatch &&
      deliveryMatch &&
      immediateMatch &&
      conditionMatch &&
      minPriceMatch &&
      maxPriceMatch
    );
  }

  private sortListings(listings: readonly MarketplaceListing[], sortBy: SortOption): MarketplaceListing[] {
    const sorted = [...listings];
    switch (sortBy) {
      case 'best_match':
        return sorted.sort((a, b) => b.matchScore - a.matchScore);
      case 'lowest_price':
        return sorted.sort(
          (a, b) => (a.pricePerUnitUsd ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnitUsd ?? Number.MAX_SAFE_INTEGER)
        );
      case 'highest_volume':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
}
