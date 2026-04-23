import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PurchasePreference } from '../../../core/models/app.models';
import { PurchasePreferencesRepository } from '../infrastructure/purchase-preferences.repository';

@Injectable({ providedIn: 'root' })
export class PurchasePreferencesFacade {
  private readonly repository = inject(PurchasePreferencesRepository);

  readonly preferences = signal<readonly PurchasePreference[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.preferences.set(data));
  }

  create(preference: PurchasePreference): void {
    this.loading.set(true);
    this.repository
      .save(preference)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.load());
  }
}
