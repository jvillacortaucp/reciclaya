import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { WASTE_SELL_COPY } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteMediaUpload, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellMockRepository } from '../infrastructure/waste-sell.mock.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellFacade {
  private readonly repository = inject(WasteSellMockRepository);

  readonly loading = signal(false);
  readonly draftLoading = signal(false);
  readonly publishLoading = signal(false);
  readonly previewLoading = signal(false);

  readonly state = signal<WasteSellPageState | null>(null);
  readonly preview = signal<ListingPreviewSummary | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly completion = computed(() => this.preview()?.completionPercentage ?? 0);
  readonly statusLabel = computed(() => this.preview()?.statusLabel ?? WASTE_SELL_COPY.statusDraft);

  loadInitialState(): void {
    this.loading.set(true);
    this.repository
      .getInitialState()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((state) => {
        this.state.set(state);
        this.refreshPreview();
      });
  }

  updateState(nextState: WasteSellPageState): void {
    this.state.set(nextState);
    this.refreshPreview();
  }

  updateMedia(mediaUploads: readonly WasteMediaUpload[]): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.updateState({
      ...current,
      formValue: {
        ...current.formValue,
        mediaUploads
      }
    });
  }

  saveDraft(state: WasteSellPageState): void {
    this.draftLoading.set(true);
    this.repository
      .saveDraft(state)
      .pipe(finalize(() => this.draftLoading.set(false)))
      .subscribe((nextState) => {
        this.state.set(nextState);
        this.toastMessage.set('Borrador guardado correctamente.');
        this.refreshPreview();
      });
  }

  publish(state: WasteSellPageState): void {
    this.publishLoading.set(true);
    this.repository
      .publish(state)
      .pipe(finalize(() => this.publishLoading.set(false)))
      .subscribe((nextState) => {
        this.state.set(nextState);
        this.toastMessage.set('Listado publicado en modo MVP mock.');
        this.refreshPreview();
      });
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }

  private refreshPreview(): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.previewLoading.set(true);
    this.repository
      .buildPreview(current)
      .pipe(finalize(() => this.previewLoading.set(false)))
      .subscribe((summary) => this.preview.set(summary));
  }
}
