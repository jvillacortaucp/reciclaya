import { Observable } from 'rxjs';
import { ListingPreviewSummary, WasteSellPageState } from './waste-sell.models';

export interface WasteSellRepository {
  getInitialState(): Observable<WasteSellPageState>;
  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState>;
  publish(state: WasteSellPageState): Observable<WasteSellPageState>;
  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary>;
}
