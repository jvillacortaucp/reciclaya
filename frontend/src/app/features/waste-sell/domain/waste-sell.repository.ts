import { Observable } from 'rxjs';
import { ListingPreviewSummary, WasteSellPageState } from './waste-sell.models';

export interface WasteSellRepository {
  getInitialState(listingId?: string | null): Observable<WasteSellPageState>;
  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState>;
  publish(state: WasteSellPageState, listingId?: string | null): Observable<WasteSellPageState>;
  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary>;
}
