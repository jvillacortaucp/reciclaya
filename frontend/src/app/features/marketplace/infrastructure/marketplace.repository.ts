import { delay, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { ListingDetail, WasteListing } from '../../../core/models/app.models';
import { LISTING_DETAIL_MOCK, WASTE_LISTINGS_MOCK } from '../../../../assets/mocks/marketplace.mock';
import { MARKETPLACE_DATASET_MOCK } from '../../../../assets/mocks/marketplace-screen.mock';
import { MarketplaceDataset } from '../domain/marketplace.models';

@Injectable({ providedIn: 'root' })
export class MarketplaceRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  getDataset(): Observable<MarketplaceDataset> {
    return of(MARKETPLACE_DATASET_MOCK).pipe(delay(this.latency));
  }

  list(): Observable<readonly WasteListing[]> {
    return of(WASTE_LISTINGS_MOCK).pipe(delay(this.latency));
  }

  detail(id: string): Observable<ListingDetail | null> {
    return of(LISTING_DETAIL_MOCK[id] ?? null).pipe(delay(this.latency));
  }
}
