import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { LISTING_DETAIL_MESSAGES } from '../data/listing-detail.constants';
import { ListingDetailEntity } from '../domain/listing-detail.models';
import { ValorizationIdea, ValorizationIdeasState } from '../domain/valorization-ideas.models';
import { ListingDetailHttpRepository } from '../infrastructure/listing-detail.http.repository';
import { ValorizationIdeasHttpRepository } from '../infrastructure/valorization-ideas-http.repository';
import { RequestsHttpRepository } from '../../requests/requests-http.repository';

@Injectable({ providedIn: 'root' })
export class ListingDetailFacade {
  private readonly repository = inject(ListingDetailHttpRepository);
  private readonly valorizationIdeasRepository = inject(ValorizationIdeasHttpRepository);
  private readonly requestsRepository = inject(RequestsHttpRepository);
  private readonly sessionStorage = inject(SessionStorageService);
  private lastUserId: string | null | undefined = undefined;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly contacting = signal(false);
  readonly detail = signal<ListingDetailEntity | null>(null);
  readonly activeMediaId = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);
  readonly valorizationIdeasState = signal<ValorizationIdeasState>({
    items: [],
    loading: false,
    generating: false,
    loaded: false
  });
  readonly valorizationIdeas = computed(() => this.valorizationIdeasState().items);
  readonly valorizationIdeasLoading = computed(() => this.valorizationIdeasState().loading);
  readonly valorizationIdeasGenerating = computed(() => this.valorizationIdeasState().generating);
  readonly valorizationIdeasLoaded = computed(() => this.valorizationIdeasState().loaded);

  readonly activeMedia = computed(() => {
    const current = this.detail();
    const activeId = this.activeMediaId();
    if (!current) {
      return null;
    }

    return current.media.find((item) => item.id === activeId) ?? current.media[0] ?? null;
  });

  constructor() {
    effect(() => {
      const currentUserId = this.sessionStorage.session()?.user.id ?? null;

      if (this.lastUserId === undefined) {
        this.lastUserId = currentUserId;
        return;
      }

      if (this.lastUserId !== currentUserId) {
        this.lastUserId = currentUserId;
        this.resetState();
      }
    });
  }

  load(id: string): void {
    this.detail.set(null);
    this.activeMediaId.set(null);
    this.valorizationIdeasState.set({
      items: [],
      loading: false,
      generating: false,
      loaded: false
    });
    this.loading.set(true);
    this.repository
      .getById(id)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo cargar el detalle del listado.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((detail) => {
        this.detail.set(detail);
        this.activeMediaId.set(detail?.media[0]?.id ?? null);
      });
  }

  selectMedia(id: string): void {
    this.activeMediaId.set(id);
  }

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toastMessage.set(LISTING_DETAIL_MESSAGES.saved);
    }, 400);
  }

  contactSeller(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    this.contacting.set(true);
    this.requestsRepository
      .create({
        listingId: detail.id,
        message: 'Estoy interesado en este lote'
      })
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo enviar la solicitud al vendedor.'));
          return EMPTY;
        }),
        finalize(() => this.contacting.set(false))
      )
      .subscribe(() => {
        this.toastMessage.set(LISTING_DETAIL_MESSAGES.contacted);
      });
  }

  generateValorizationIdeas(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    this.valorizationIdeasState.update((state) => ({
      ...state,
      generating: true,
      loaded: true
    }));

    this.valorizationIdeasRepository
      .generate(detail.id)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudieron generar las ideas con IA.'));
          return EMPTY;
        }),
        finalize(() =>
          this.valorizationIdeasState.update((state) => ({
            ...state,
            generating: false
          }))
        )
      )
      .subscribe((ideas) => {
        this.valorizationIdeasState.set({
          items: ideas,
          loading: false,
          generating: false,
          loaded: true
        });
      });
  }

  loadValorizationIdeas(): void {
    const detail = this.detail();
    if (!detail) {
      return;
    }

    this.valorizationIdeasState.set({
      items: [],
      loading: true,
      generating: false,
      loaded: true
    });

    this.valorizationIdeasRepository
      .getByListingId(detail.id)
      .pipe(
        catchError(() => {
          this.valorizationIdeasState.set({
            items: [],
            loading: false,
            generating: false,
            loaded: true
          });
          return EMPTY;
        }),
        finalize(() =>
          this.valorizationIdeasState.update((state) => ({
            ...state,
            loading: false
          }))
        )
      )
      .subscribe((ideas) => {
        this.valorizationIdeasState.set({
          items: ideas,
          loading: false,
          generating: false,
          loaded: true
        });
      });
  }

  resetValorizationIdeasView(): void {
    this.valorizationIdeasState.set({
      items: [],
      loading: false,
      generating: false,
      loaded: false
    });
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }

  private resetState(): void {
    this.loading.set(false);
    this.saving.set(false);
    this.contacting.set(false);
    this.detail.set(null);
    this.activeMediaId.set(null);
    this.toastMessage.set(null);
      this.valorizationIdeasState.set({
        items: [],
        loading: false,
        generating: false,
        loaded: false
      });
  }
}

