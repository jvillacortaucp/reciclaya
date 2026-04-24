import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { PURCHASE_PREFERENCES_INITIAL_STATE_MOCK } from '../../../../assets/mocks/purchase-preferences.mock';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PURCHASE_PREFERENCES_MESSAGES } from '../data/purchase-preferences.constants';
import { PurchasePreferencesRepository } from '../domain/purchase-preferences.repository';
import {
  PurchasePreferencesPageState,
  SummaryPreviewData
} from '../domain/purchase-preferences.models';

@Injectable({ providedIn: 'root' })
export class PurchasePreferencesMockRepository implements PurchasePreferencesRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly storedState = signal<PurchasePreferencesPageState>(PURCHASE_PREFERENCES_INITIAL_STATE_MOCK);

  getInitialState(): Observable<PurchasePreferencesPageState> {
    return of(this.storedState()).pipe(delay(this.latency));
  }

  savePreference(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState> {
    const nextState: PurchasePreferencesPageState = {
      ...state,
      draftSavedAt: new Date().toISOString()
    };

    this.storedState.set(nextState);
    return of(nextState).pipe(delay(this.latency));
  }

  activateAlert(state: PurchasePreferencesPageState): Observable<PurchasePreferencesPageState> {
    const nextState: PurchasePreferencesPageState = {
      ...state,
      formValue: {
        ...state.formValue,
        alerts: {
          ...state.formValue.alerts,
          alertOnMatch: true
        }
      },
      smartRecommendationNote: PURCHASE_PREFERENCES_MESSAGES.activated
    };

    this.storedState.set(nextState);
    return of(nextState).pipe(delay(this.latency));
  }

  buildSummary(state: PurchasePreferencesPageState): Observable<SummaryPreviewData> {
    const volumeLabel = `${state.formValue.sourcing.requiredVolume} ${
      state.formValue.sourcing.unit === 'tons'
        ? 'Ton'
        : state.formValue.sourcing.unit === 'kg'
          ? 'Kg'
          : 'm3'
    } / ${this.mapFrequency(state.formValue.sourcing.purchaseFrequency)}`;
    const summary: SummaryPreviewData = {
      materialLabel: state.formValue.desiredResidue.specificResidue || 'No definido',
      volumeLabel,
      logisticsLabel: `Radio ${state.formValue.logistics.radiusKm}km - ${state.formValue.logistics.receivingLocation}`,
      urgencyLabel: this.mapPriority(state.formValue.alerts.priority)
    };

    return of(summary).pipe(delay(Math.round(this.latency * 0.8)));
  }

  private mapFrequency(value: PurchasePreferencesPageState['formValue']['sourcing']['purchaseFrequency']): string {
    switch (value) {
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
      case 'recurring':
        return 'Recurrente';
      default:
        return 'Única compra';
    }
  }

  private mapPriority(value: PurchasePreferencesPageState['formValue']['alerts']['priority']): string {
    switch (value) {
      case 'high':
        return 'Urgente';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  }
}
