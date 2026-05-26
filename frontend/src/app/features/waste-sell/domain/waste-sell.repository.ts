import { Observable } from 'rxjs';
import { ListingPreviewSummary, WasteSellPageState } from './waste-sell.models';
import { RegulationEvidencePrecheckResult, RegulationEvidenceVerificationResult } from '../../../core/regulatory/regulation-api.models';

export interface WasteSellPublishResult {
  readonly state: WasteSellPageState;
  readonly complianceWarnings: readonly RegulationEvidenceVerificationResult[];
}

export interface WasteSellRepository {
  getInitialState(listingId?: string | null): Observable<WasteSellPageState>;
  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState>;
  publish(state: WasteSellPageState, evidenceVerified: boolean, listingId?: string | null): Observable<WasteSellPublishResult>;
  verifyListingEvidence(state: WasteSellPageState): Observable<RegulationEvidencePrecheckResult>;
  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary>;
}
