import { Observable } from 'rxjs';
import { MarketplaceDataset, MarketplaceListingsPage, MarketplaceListingsQuery } from './marketplace.models';

export interface MarketplaceRepositoryContract {
  getDataset(): Observable<MarketplaceDataset>;
  getListings(query: MarketplaceListingsQuery): Observable<MarketplaceListingsPage>;
}
