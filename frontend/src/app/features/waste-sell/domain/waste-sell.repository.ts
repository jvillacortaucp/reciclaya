import { Observable } from 'rxjs';
import { ListingPreviewSummary, WasteSellPageState } from './waste-sell.models';
import { RegulationEvidenceVerificationResult } from '../../../core/regulatory/regulation-api.models';

export interface WasteSellRepository {
  getInitialState(listingId?: string | null): Observable<WasteSellPageState>;
  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState>;
  publish(state: WasteSellPageState, listingId?: string | null): Observable<WasteSellPageState>;
  verifyListingEvidence(state: WasteSellPageState): Observable<RegulationEvidenceVerificationResult>;
  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary>;
}
