import { inject, Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { MY_LISTINGS_MOCK } from '../data/my-listings.mock';
import { MyListing, MyListingsQuery } from '../domain/my-listing.model';

@Injectable({ providedIn: 'root' })
export class MyListingsMockService {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly listings: MyListing[] = [...MY_LISTINGS_MOCK];

  getListings(query: MyListingsQuery): Observable<readonly MyListing[]> {
    return of(this.listings).pipe(
      map((items) => this.applyFilters(items, query)),
      delay(this.latency + 150)
    );
  }

  updateListingStatus(id: string, status: MyListing['status']): Observable<MyListing | null> {
    const index = this.listings.findIndex((item) => item.id === id);
    if (index < 0) {
      return of(null).pipe(delay(this.latency));
    }

    this.listings[index] = {
      ...this.listings[index],
      status
    };
    return of(this.listings[index]).pipe(delay(this.latency));
  }

  private applyFilters(items: readonly MyListing[], query: MyListingsQuery): readonly MyListing[] {
    const filters = query.filters;

    return items.filter((item) => {
      const searchValue = filters.searchQuery.trim().toLowerCase();
      const searchableContent = `${item.title} ${item.specificResidue} ${item.exchangeLabel} ${item.location ?? ''}`.toLowerCase();
      const searchMatch = !searchValue || searchableContent.includes(searchValue);
      const residueTypeMatch = filters.residueType === 'all' || item.residueType === filters.residueType;
      const sectorMatch = filters.sector === 'all' || item.sector === filters.sector;
      const productMatch = filters.productType === 'all' || item.productType === filters.productType;
      const residueMatch =
        !filters.specificResidue ||
        item.specificResidue.toLowerCase().includes(filters.specificResidue.toLowerCase());
      const statusMatch = filters.status === 'all' || item.status === filters.status;
      const exchangeMatch = filters.exchangeType === 'all' || item.exchangeType === filters.exchangeType;
      const dateMatch = !filters.publishedDate || item.publishedAt === filters.publishedDate;

      return (
        searchMatch &&
        residueTypeMatch &&
        sectorMatch &&
        productMatch &&
        residueMatch &&
        statusMatch &&
        exchangeMatch &&
        dateMatch
      );
    });
  }
}
