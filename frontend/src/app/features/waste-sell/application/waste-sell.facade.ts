import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { ValorizationIdea } from '../../listing-detail/domain/valorization-ideas.models';
import { ValorizationIdeasHttpRepository } from '../../listing-detail/infrastructure/valorization-ideas-http.repository';
import { WASTE_SELL_COPY } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteMediaUpload, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellHttpRepository } from '../infrastructure/waste-sell.http.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellFacade {
  private readonly repository = inject(WasteSellHttpRepository);
  private readonly valorizationIdeasRepository = inject(ValorizationIdeasHttpRepository);
  private readonly sessionStorage = inject(SessionStorageService);
  private lastUserId: string | null | undefined = undefined;

  readonly loading = signal(false);
  readonly draftLoading = signal(false);
  readonly publishLoading = signal(false);
  readonly previewLoading = signal(false);
  readonly valorizationIdeasLoading = signal(false);
  readonly valorizationIdeasGenerated = signal(false);
  readonly valorizationIdeasStale = signal(false);

  readonly state = signal<WasteSellPageState | null>(null);
  readonly preview = signal<ListingPreviewSummary | null>(null);
  readonly valorizationIdeas = signal<readonly ValorizationIdea[]>([]);
  readonly toastMessage = signal<string | null>(null);
  readonly valorizationIdeasSignature = signal<string | null>(null);

  readonly completion = computed(() => this.preview()?.completionPercentage ?? 0);
  readonly statusLabel = computed(() => this.preview()?.statusLabel ?? WASTE_SELL_COPY.statusDraft);

  constructor() {
    effect(() => {
      const currentUserId = this.sessionStorage.session()?.user.id ?? null;

      if (this.lastUserId === undefined) {
        this.lastUserId = currentUserId;
        return;
      }

      if (this.lastUserId !== currentUserId) {
        this.lastUserId = currentUserId;
        this.resetPageState();
      }
    });
  }

  loadInitialState(): void {
    this.resetValorizationIdeas();
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
    const previousState = this.state();
    this.state.set(nextState);
    this.syncValorizationIdeasFreshness(previousState, nextState);
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

  generateValorizationIdeas(state: WasteSellPageState): void {
    this.valorizationIdeasLoading.set(true);
    this.valorizationIdeasRepository
      .previewFromWasteSell(state)
      .pipe(
        catchError(() => {
          this.toastMessage.set('No pudimos generar ideas ahora. Puedes publicar igual.');
          return EMPTY;
        }),
        finalize(() => this.valorizationIdeasLoading.set(false))
      )
      .subscribe((ideas) => {
        this.valorizationIdeas.set(ideas);
        this.valorizationIdeasGenerated.set(true);
        this.valorizationIdeasStale.set(false);
        this.valorizationIdeasSignature.set(this.buildKeySignature(state));
      });
  }

  resetValorizationIdeas(): void {
    this.valorizationIdeas.set([]);
    this.valorizationIdeasGenerated.set(false);
    this.valorizationIdeasStale.set(false);
    this.valorizationIdeasSignature.set(null);
  }

  resetTransientValorizationIdeas(): void {
    this.valorizationIdeasLoading.set(false);
    this.resetValorizationIdeas();
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

  private syncValorizationIdeasFreshness(
    previousState: WasteSellPageState | null,
    nextState: WasteSellPageState
  ): void {
    if (!this.valorizationIdeasGenerated()) {
      return;
    }

    const previousSignature = previousState ? this.buildKeySignature(previousState) : null;
    const nextSignature = this.buildKeySignature(nextState);

    if (previousSignature !== nextSignature) {
      this.valorizationIdeasStale.set(true);
    }
  }

  private buildKeySignature(state: WasteSellPageState): string {
    const form = state.formValue;
    return JSON.stringify({
      residueType: form.residueType,
      sector: form.sector,
      productType: form.productType,
      specificResidue: form.specificResidue.trim(),
      shortDescription: form.shortDescription.trim(),
      quantity: form.volume.quantity,
      unit: form.volume.unit,
      condition: form.additional.condition,
      warehouseAddress: form.logistics.warehouseAddress.trim()
    });
  }

  private resetPageState(): void {
    this.state.set(null);
    this.preview.set(null);
    this.toastMessage.set(null);
    this.loading.set(false);
    this.draftLoading.set(false);
    this.publishLoading.set(false);
    this.previewLoading.set(false);
    this.valorizationIdeasLoading.set(false);
    this.resetValorizationIdeas();
  }
}
