import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LISTING_DETAIL_MESSAGES } from '../data/listing-detail.constants';
import { ListingDetailEntity } from '../domain/listing-detail.models';
import { ListingDetailMockRepository } from '../infrastructure/listing-detail.mock.repository';

@Injectable({ providedIn: 'root' })
export class ListingDetailFacade {
  private readonly repository = inject(ListingDetailMockRepository);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly contacting = signal(false);
  readonly detail = signal<ListingDetailEntity | null>(null);
  readonly activeMediaId = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly activeMedia = computed(() => {
    const current = this.detail();
    const activeId = this.activeMediaId();
    if (!current) {
      return null;
    }

    return current.media.find((item) => item.id === activeId) ?? current.media[0] ?? null;
  });

  load(id: string): void {
    this.loading.set(true);
    this.repository
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
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
    this.contacting.set(true);
    setTimeout(() => {
      this.contacting.set(false);
      this.toastMessage.set(LISTING_DETAIL_MESSAGES.contacted);
    }, 500);
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }
}

