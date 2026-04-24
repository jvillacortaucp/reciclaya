import { Observable } from 'rxjs';
import { MarketplaceDataset } from './marketplace.models';

export interface MarketplaceRepositoryContract {
  getDataset(): Observable<MarketplaceDataset>;
}

