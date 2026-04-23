import { inject, Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { PurchasePreference } from '../../../core/models/app.models';
import { PURCHASE_PREFERENCES_MOCK } from '../../../../assets/mocks/marketplace.mock';

@Injectable({ providedIn: 'root' })
export class PurchasePreferencesRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly preferences = signal<readonly PurchasePreference[]>(PURCHASE_PREFERENCES_MOCK);

  list(): Observable<readonly PurchasePreference[]> {
    return of(this.preferences()).pipe(delay(this.latency));
  }

  save(preference: PurchasePreference): Observable<PurchasePreference> {
    this.preferences.update((current) => [preference, ...current]);
    return of(preference).pipe(delay(this.latency));
  }
}
