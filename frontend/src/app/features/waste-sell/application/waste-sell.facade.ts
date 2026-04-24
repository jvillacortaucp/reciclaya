import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { WASTE_SELL_COPY } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteMediaUpload, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellHttpRepository } from '../infrastructure/waste-sell.http.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellFacade {
  private readonly repository = inject(WasteSellHttpRepository);

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
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo guardar el borrador.'));
          return EMPTY;
        }),
        finalize(() => this.draftLoading.set(false))
      )
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
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo publicar el listado.'));
          return EMPTY;
        }),
        finalize(() => this.publishLoading.set(false))
      )
      .subscribe((nextState) => {
        this.state.set(nextState);
        this.toastMessage.set('Listado publicado correctamente.');
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
      .pipe(
        catchError(() => EMPTY),
        finalize(() => this.previewLoading.set(false))
      )
      .subscribe((summary) => this.preview.set(summary));
  }
}
