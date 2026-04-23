import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { WASTE_SELL_MOCK_STATE } from '../../../../assets/mocks/waste-sell.mock';
import { WASTE_SELL_COPY } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellRepository } from '../domain/waste-sell.repository';

const DRAFT_KEY = 'waste-sell-operational-draft';

@Injectable({ providedIn: 'root' })
export class WasteSellMockRepository implements WasteSellRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  getInitialState(): Observable<WasteSellPageState> {
    const persisted = localStorage.getItem(DRAFT_KEY);
    if (!persisted) {
      return of(WASTE_SELL_MOCK_STATE).pipe(delay(this.latency));
    }

    try {
      const parsed = JSON.parse(persisted) as WasteSellPageState;
      return of(parsed).pipe(delay(this.latency));
    } catch {
      return of(WASTE_SELL_MOCK_STATE).pipe(delay(this.latency));
    }
  }

  saveDraft(state: WasteSellPageState): Observable<WasteSellPageState> {
    const nextState: WasteSellPageState = {
      ...state,
      draftSavedAt: new Date().toISOString()
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(nextState));
    return of(nextState).pipe(delay(this.latency));
  }

  publish(state: WasteSellPageState): Observable<WasteSellPageState> {
    const nextState: WasteSellPageState = {
      ...state,
      draftSavedAt: new Date().toISOString()
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(nextState));
    return of(nextState).pipe(delay(this.latency + 180));
  }

  buildPreview(state: WasteSellPageState): Observable<ListingPreviewSummary> {
    const value = state.formValue;
    const total = value.volume.quantity * value.volume.estimatedCostPerUnit;
    const completion = this.calculateCompletion(state);

    const summary: ListingPreviewSummary = {
      title: value.specificResidue || 'Residuo sin titulo',
      residueTypeLabel: value.residueType === 'organic' ? 'ORGANICO' : 'INORGANICO',
      sectorLabel: value.sector,
      volumeLabel: `${value.volume.quantity} ${value.volume.unit}`,
      estimatedValueLabel: `$${total.toFixed(2)} USD`,
      locationLabel: value.logistics.warehouseAddress || 'Ubicacion pendiente',
      availabilityLabel: value.logistics.immediateAvailability ? 'Disponible hoy' : 'Disponibilidad programada',
      statusLabel: completion >= 85 ? 'LISTO PARA PUBLICAR' : 'BORRADOR',
      completionPercentage: completion
    };

    return of(summary).pipe(delay(Math.round(this.latency / 2)));
  }

  private calculateCompletion(state: WasteSellPageState): number {
    const value = state.formValue;
    const checks = [
      value.specificResidue.length > 3,
      value.shortDescription.length > 10,
      value.logistics.warehouseAddress.length > 5,
      value.mediaUploads.length > 0,
      value.additional.nextAvailabilityDate.length > 0
    ];

    const totalChecks = checks.length;
    const doneChecks = checks.filter(Boolean).length;
    const ratio = doneChecks / totalChecks;

    return Math.min(100, Math.round(ratio * 100));
  }
}
