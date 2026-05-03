import { Observable } from 'rxjs';
import { PurchasePreferencesPageState, SummaryPreviewData } from './purchase-preferences.models';

export interface PurchasePreferencesRepository {
  getInitialState(): Observable<PurchasePreferencesPageState>;
  savePreference(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState>;
  activateAlert(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState>;
  buildSummary(state: PurchasePreferencesPageState): Observable<SummaryPreviewData>;
}

