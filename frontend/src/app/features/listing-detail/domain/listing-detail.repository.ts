import { Observable } from 'rxjs';
import { ListingDetailEntity } from './listing-detail.models';

export interface ListingDetailRepository {
  getById(id: string): Observable<ListingDetailEntity | null>;
}

