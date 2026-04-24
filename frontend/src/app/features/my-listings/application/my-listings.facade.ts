import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MY_LISTINGS_COPY, MY_LISTINGS_DEFAULT_FILTERS } from '../data/my-listings.constants';
import {
  ListingActionFeedback,
  ListingCountByStatus,
  ListingTab,
  MyListing,
  MyListingsFilterState
} from '../domain/my-listing.model';
import { MyListingsMockService } from '../infrastructure/my-listings.mock.service';

@Injectable({ providedIn: 'root' })
export class MyListingsFacade {
  private readonly service = inject(MyListingsMockService);

  readonly loading = signal(false);
  readonly actionLoadingId = signal<string | null>(null);
  readonly filters = signal<MyListingsFilterState>(MY_LISTINGS_DEFAULT_FILTERS);
  readonly activeTab = signal<ListingTab>('active');
  readonly listings = signal<readonly MyListing[]>([]);
  readonly toast = signal<ListingActionFeedback | null>(null);

  readonly filteredByTab = computed(() =>
    this.listings().filter((item) => item.status === this.activeTab())
  );

  readonly counts = computed<ListingCountByStatus>(() => {
    const all = this.listings();
    return {
      active: all.filter((item) => item.status === 'active').length,
      draft: all.filter((item) => item.status === 'draft').length,
      inactive: all.filter((item) => item.status === 'inactive').length
    };
  });

  readonly isEmpty = computed(() => !this.loading() && this.filteredByTab().length === 0);

  loadListings(): void {
    this.loading.set(true);
    this.service
      .getListings({ filters: this.filters() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((items) => this.listings.set(items));
  }

  setFilters(nextFilters: MyListingsFilterState): void {
    this.filters.set(nextFilters);
    this.loadListings();
  }

  clearFilters(): void {
    this.filters.set(MY_LISTINGS_DEFAULT_FILTERS);
    this.loadListings();
  }

  setTab(tab: ListingTab): void {
    this.activeTab.set(tab);
  }

  deactivate(id: string): void {
    this.actionLoadingId.set(id);
    this.service
      .updateListingStatus(id, 'inactive')
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe((updated) => {
        if (!updated) {
          return;
        }

        this.listings.update((items) =>
          items.map((item) => (item.id === id ? { ...item, status: 'inactive' } : item))
        );
        this.activeTab.set('inactive');
        this.toast.set({ type: 'success', message: MY_LISTINGS_COPY.deactivatedSuccess });
      });
  }

  restore(id: string): void {
    this.actionLoadingId.set(id);
    this.service
      .updateListingStatus(id, 'active')
      .pipe(finalize(() => this.actionLoadingId.set(null)))
      .subscribe((updated) => {
        if (!updated) {
          return;
        }

        this.listings.update((items) =>
          items.map((item) => (item.id === id ? { ...item, status: 'active' } : item))
        );
        this.activeTab.set('active');
        this.toast.set({ type: 'success', message: MY_LISTINGS_COPY.restoredSuccess });
      });
  }

  showExportToast(): void {
    this.toast.set({ type: 'info', message: MY_LISTINGS_COPY.exportedSuccess });
  }

  clearToast(): void {
    this.toast.set(null);
  }
}
