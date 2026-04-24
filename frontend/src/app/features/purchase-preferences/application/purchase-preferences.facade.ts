import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PURCHASE_PREFERENCES_MESSAGES } from '../data/purchase-preferences.constants';
import {
  PurchasePreferencesPageState,
  SummaryPreviewData
} from '../domain/purchase-preferences.models';
import { PurchasePreferencesMockRepository } from '../infrastructure/purchase-preferences.repository';

@Injectable({ providedIn: 'root' })
export class PurchasePreferencesFacade {
  private readonly repository = inject(PurchasePreferencesMockRepository);

  readonly loading = signal(false);
  readonly saveLoading = signal(false);
  readonly previewLoading = signal(false);
  readonly activateLoading = signal(false);
  readonly toastMessage = signal<string | null>(null);

  readonly state = signal<PurchasePreferencesPageState | null>(null);
  readonly summary = signal<SummaryPreviewData | null>(null);
  readonly completion = computed(() => this.state()?.profileStatus.completionPercentage ?? 0);

  loadInitialState(): void {
    this.loading.set(true);
    this.repository
      .getInitialState()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((state) => {
        this.state.set(state);
        this.refreshSummary();
      });
  }

  updateState(nextState: PurchasePreferencesPageState): void {
    this.state.set(nextState);
    this.refreshSummary();
  }

  savePreference(state: PurchasePreferencesPageState): void {
    this.saveLoading.set(true);
    this.repository
      .savePreference(state)
      .pipe(finalize(() => this.saveLoading.set(false)))
      .subscribe((nextState) => {
        this.state.set(nextState);
        this.toastMessage.set(PURCHASE_PREFERENCES_MESSAGES.saved);
        this.refreshSummary();
      });
  }

  activateAlert(state: PurchasePreferencesPageState): void {
    this.activateLoading.set(true);
    this.repository
      .activateAlert(state)
      .pipe(finalize(() => this.activateLoading.set(false)))
      .subscribe((nextState) => {
        this.state.set(nextState);
        this.toastMessage.set(PURCHASE_PREFERENCES_MESSAGES.activated);
        this.refreshSummary();
      });
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }

  private refreshSummary(): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.previewLoading.set(true);
    this.repository
      .buildSummary(current)
      .pipe(finalize(() => this.previewLoading.set(false)))
      .subscribe((summary) => this.summary.set(summary));
  }
}
