import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse, ListingDetail, WasteListing } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import {
  MarketplaceDataset,
  MarketplaceListing,
  MarketplaceListingsPage,
  MarketplaceListingsQuery
} from '../domain/marketplace.models';

@Injectable({ providedIn: 'root' })
export class MarketplaceRepository {
  private readonly http = inject(HttpClient);

  getDataset(): Observable<MarketplaceDataset> {
    return this.getListings({
      page: 1,
      pageSize: 12,
      filters: {
        wasteType: 'all',
        sector: 'all',
        productType: 'all',
        specificResidue: '',
        exchangeType: 'all',
        location: '',
        minPrice: null,
        maxPrice: null,
        deliveryMode: 'all',
        immediateOnly: false,
        residueCondition: 'all'
      },
      query: '',
      sortBy: 'best_match'
    }).pipe(
      map((page) => ({
        listings: page.items,
        recommended: page.items
          .slice(0, 3)
          .map((listing) => ({
            listingId: listing.id,
            reason: 'Disponible en marketplace',
            score: listing.matchScore
          }))
      }))
    );
  }

  getListings(query: MarketplaceListingsQuery): Observable<MarketplaceListingsPage> {
    return this.http
      .get<ApiResponse<MarketplaceListingsPage>>(`${environment.apiBaseUrl}/public/marketplace/products`, {
        params: this.buildListingParams(query)
      })
      .pipe(
        map(unwrapApiResponse),
        map((page) => ({
          ...page,
          items: this.sortListings(this.filterUnsupportedLocally(page.items, query), query.sortBy)
        })),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudieron cargar los listados.'))
        )
      );
  }

  list(): Observable<readonly WasteListing[]> {
    return this.getListings({
      page: 1,
      pageSize: 50,
      filters: {
        wasteType: 'all',
        sector: 'all',
        productType: 'all',
        specificResidue: '',
        exchangeType: 'all',
        location: '',
        minPrice: null,
        maxPrice: null,
        deliveryMode: 'all',
        immediateOnly: false,
        residueCondition: 'all'
      },
      query: '',
      sortBy: 'newest'
    }).pipe(map((page) => page.items.map(toWasteListing)));
  }

  detail(id: string): Observable<ListingDetail | null> {
    return this.http
      .get<ApiResponse<ListingDetail>>(`${environment.apiBaseUrl}/public/marketplace/products/${id}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo cargar el detalle.')))
      );
  }

  private buildListingParams(query: MarketplaceListingsQuery): HttpParams {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    const filters = query.filters;

    if (query.query.trim()) {
      params = params.set('query', query.query.trim());
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    if (filters.wasteType !== 'all') {
      params = params.set('wasteType', filters.wasteType);
    }

    if (filters.sector !== 'all') {
      params = params.set('sector', filters.sector);
    }

    if (filters.productType !== 'all') {
      params = params.set('productType', filters.productType);
    }

    if (filters.specificResidue) {
      params = params.set('specificResidue', filters.specificResidue);
    }

    if (filters.exchangeType !== 'all') {
      params = params.set('exchangeType', filters.exchangeType);
    }

    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice);
    }

    if (filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice);
    }

    if (filters.deliveryMode !== 'all') {
      params = params.set('deliveryMode', filters.deliveryMode);
    }

    if (filters.immediateOnly) {
      params = params.set('immediateOnly', true);
    }

    if (filters.residueCondition !== 'all') {
      params = params.set('residueCondition', filters.residueCondition);
    }

    return params;
  }

  private filterUnsupportedLocally(
    listings: readonly MarketplaceListing[],
    query: MarketplaceListingsQuery
  ): MarketplaceListing[] {
    const text = query.query.toLowerCase().trim();
    const filters = query.filters;

    return listings.filter((listing) => {
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
    });
  }

  private sortListings(
    listings: readonly MarketplaceListing[],
    sortBy: MarketplaceListingsQuery['sortBy']
  ): MarketplaceListing[] {
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

function toWasteListing(listing: MarketplaceListing): WasteListing {
  return {
    id: listing.id,
    title: listing.specificResidue,
    category: listing.productType,
    description: listing.residueCondition,
    pricePerUnit: listing.pricePerUnitUsd ?? 0,
    currency: 'PEN',
    volume: {
      amount: listing.quantity,
      unit: listing.unit === 'tons' ? 'ton' : 'kg'
    },
    sellerName: '',
    createdAt: listing.createdAt,
    tags: [listing.wasteType, listing.sector, listing.exchangeType]
  };
}
