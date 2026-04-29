import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, firstValueFrom } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { MediaHttpRepository } from '../../../core/media/media-http.repository';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { MarketplaceListing } from '../../marketplace/domain/marketplace.models';
import { MyListingsRepository } from '../../my-listings/my-listings.repository';
import { ValorizationIdea } from '../../listing-detail/domain/valorization-ideas.models';
import { ValorizationIdeasHttpRepository } from '../../listing-detail/infrastructure/valorization-ideas-http.repository';
import { WASTE_SELL_COPY } from '../data/waste-sell.constants';
import { ListingPreviewSummary, WasteMediaUpload, WasteSellPageState } from '../domain/waste-sell.models';
import { WasteSellHttpRepository } from '../infrastructure/waste-sell.http.repository';

@Injectable({ providedIn: 'root' })
export class WasteSellFacade {
  private readonly repository = inject(WasteSellHttpRepository);
  private readonly router = inject(Router);
  private readonly valorizationIdeasRepository = inject(ValorizationIdeasHttpRepository);
  private readonly mediaRepository = inject(MediaHttpRepository);
  private readonly myListingsRepository = inject(MyListingsRepository);
  private readonly sessionStorage = inject(SessionStorageService);
  private lastUserId: string | null | undefined = undefined;
  private readonly pendingFiles = new Map<string, File>();
  private currentListingId: string | null = null;

  readonly loading = signal(false);
  readonly publishLoading = signal(false);
  readonly previewLoading = signal(false);
  readonly valorizationIdeasLoading = signal(false);
  readonly valorizationIdeasGenerated = signal(false);
  readonly valorizationIdeasStale = signal(false);
  readonly mediaSyncLoading = signal(false);

  readonly state = signal<WasteSellPageState | null>(null);
  readonly preview = signal<ListingPreviewSummary | null>(null);
  readonly valorizationIdeas = signal<readonly ValorizationIdea[]>([]);
  readonly toastMessage = signal<string | null>(null);
  readonly valorizationIdeasSignature = signal<string | null>(null);

  readonly completion = computed(() => this.preview()?.completionPercentage ?? 0);
  readonly statusLabel = computed(() => this.preview()?.statusLabel ?? WASTE_SELL_COPY.statusReady);

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

  loadInitialState(listingId?: string | null): void {
    if (this.state() && this.currentListingId === (listingId ?? null)) {
      return;
    }

    this.currentListingId = listingId ?? null;
    this.resetValorizationIdeas();
    this.loading.set(true);
    this.repository
      .getInitialState(listingId)
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

  registerPendingFile(id: string, file: File): void {
    this.pendingFiles.set(id, file);
  }

  publish(state: WasteSellPageState): void {
    this.publishLoading.set(true);
    this.repository
      .publish(state, this.currentListingId)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo publicar el listado.'));
          return EMPTY;
        }),
        finalize(() => this.publishLoading.set(false))
      )
      .subscribe((nextState) => {
        const mergedState = this.mergeServerStateWithVisualMedia(nextState, this.state()?.formValue.mediaUploads ?? []);
        this.state.set(mergedState);
        this.toastMessage.set('Listado publicado correctamente.');
        this.refreshPreview();
        void this.syncListingMediaForCurrentState();
        void this.router.navigateByUrl('/app/my-listings');
      });
  }

  removeMedia(id: string): void {
    const current = this.state();
    if (!current) {
      return;
    }

    const media = current.formValue.mediaUploads.find((item) => item.id === id);
    if (!media) {
      return;
    }

    const nextMedia = current.formValue.mediaUploads.filter((item) => item.id !== id);
    this.pendingFiles.delete(id);
    this.updateMedia(nextMedia);

    if (media.mediaId && this.currentListingId) {
      this.mediaRepository.deleteListingImage(this.currentListingId, media.mediaId).subscribe({
        error: () => {
          this.toastMessage.set('No se pudo eliminar la imagen del listing.');
        }
      });
    }
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
    this.publishLoading.set(false);
    this.previewLoading.set(false);
    this.valorizationIdeasLoading.set(false);
    this.mediaSyncLoading.set(false);
    this.resetValorizationIdeas();
    this.pendingFiles.clear();
    this.currentListingId = null;
  }

  private async syncListingMediaForCurrentState(): Promise<void> {
    const current = this.state();
    if (!current) {
      return;
    }

    const pendingMedia = current.formValue.mediaUploads.filter(
      (media) => media.uploadStatus === 'pending' || media.uploadStatus === 'failed'
    );

    if (pendingMedia.length === 0) {
      return;
    }

    this.mediaSyncLoading.set(true);
    const listingId = await this.resolveCurrentListingId(current);
    if (!listingId) {
      this.markMediaUploadsAsFailed(
        pendingMedia.map((media) => media.id),
        'No se pudo identificar el listing guardado para subir las imagenes.'
      );
      this.mediaSyncLoading.set(false);
      return;
    }

    this.currentListingId = listingId;
    this.patchMediaStatuses(pendingMedia.map((media) => media.id), 'uploading');

    let failedUploads = 0;

    for (const [index, media] of pendingMedia.entries()) {
      const file = this.pendingFiles.get(media.id);
      if (!file) {
        failedUploads += 1;
        this.markMediaUploadsAsFailed([media.id], 'No se encontro el archivo local para subir.');
        continue;
      }

      try {
        const uploadedAsset = await firstValueFrom(
          this.mediaRepository.uploadListingImage(listingId, file, media.name, index)
        );

        this.pendingFiles.delete(media.id);
        this.replaceMediaUpload(media.id, {
          id: uploadedAsset.id,
          mediaId: uploadedAsset.id,
          previewUrl: uploadedAsset.url ?? media.previewUrl,
          uploadStatus: 'uploaded',
          warningMessage: null
        });
      } catch {
        failedUploads += 1;
        this.markMediaUploadsAsFailed([media.id], 'No se pudo subir una de las imagenes.');
      }
    }

    this.mediaSyncLoading.set(false);
    if (failedUploads > 0) {
      this.toastMessage.set('Algunas imagenes no se pudieron subir. Puedes continuar y volver a intentarlo.');
    }
  }

  private async resolveCurrentListingId(state: WasteSellPageState): Promise<string | null> {
    if (this.currentListingId) {
      return this.currentListingId;
    }

    try {
      const listings = await firstValueFrom(this.myListingsRepository.getMyListings());
      const match = this.findMatchingListing(listings, state);
      return match?.id ?? null;
    } catch {
      return null;
    }
  }

  private findMatchingListing(
    listings: readonly MarketplaceListing[],
    state: WasteSellPageState
  ): MarketplaceListing | null {
    const form = state.formValue;
    const normalizedResidue = form.specificResidue.trim().toLowerCase();
    const normalizedLocation = form.logistics.warehouseAddress.trim().toLowerCase();

    const candidates = [...listings]
      .filter(
        (listing) =>
          listing.productType === form.productType &&
          listing.wasteType === form.residueType &&
          listing.sector === form.sector &&
          listing.specificResidue.trim().toLowerCase() === normalizedResidue &&
          listing.location.trim().toLowerCase() === normalizedLocation &&
          listing.quantity === form.volume.quantity
      )
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    return candidates[0] ?? null;
  }

  private mergeServerStateWithVisualMedia(
    serverState: WasteSellPageState,
    visualMedia: readonly WasteMediaUpload[]
  ): WasteSellPageState {
    return {
      ...serverState,
      formValue: {
        ...serverState.formValue,
        mediaUploads: visualMedia
      }
    };
  }

  private patchMediaStatuses(ids: readonly string[], uploadStatus: WasteMediaUpload['uploadStatus']): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.state.set({
      ...current,
      formValue: {
        ...current.formValue,
        mediaUploads: current.formValue.mediaUploads.map((media) =>
          ids.includes(media.id)
            ? {
                ...media,
                uploadStatus,
                warningMessage: uploadStatus === 'uploading' ? null : media.warningMessage
              }
            : media
        )
      }
    });
  }

  private markMediaUploadsAsFailed(ids: readonly string[], warningMessage: string): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.state.set({
      ...current,
      formValue: {
        ...current.formValue,
        mediaUploads: current.formValue.mediaUploads.map((media) =>
          ids.includes(media.id)
            ? {
                ...media,
                uploadStatus: 'failed',
                warningMessage
              }
            : media
        )
      }
    });
  }

  private replaceMediaUpload(id: string, patch: Partial<WasteMediaUpload>): void {
    const current = this.state();
    if (!current) {
      return;
    }

    this.state.set({
      ...current,
      formValue: {
        ...current.formValue,
        mediaUploads: current.formValue.mediaUploads.map((media) =>
          media.id === id
            ? {
                ...media,
                ...patch
              }
            : media
        )
      }
    });
  }
}
