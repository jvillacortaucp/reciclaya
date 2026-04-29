import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { MY_LISTINGS_COPY, MY_LISTINGS_DEFAULT_FILTERS } from '../data/my-listings.constants';
import {
  ListingActionFeedback,
  ListingCountByStatus,
  ListingTab,
  MyListing,
  MyListingsFilterState
} from '../domain/my-listing.model';
import { MyListingsRepository } from '../my-listings.repository';
import { MarketplaceListing } from '../../marketplace/domain/marketplace.models';

@Injectable({ providedIn: 'root' })
export class MyListingsFacade {
  private readonly repository = inject(MyListingsRepository);

  readonly loading = signal(false);
  readonly actionLoadingId = signal<string | null>(null);
  readonly filters = signal<MyListingsFilterState>(MY_LISTINGS_DEFAULT_FILTERS);
  readonly activeTab = signal<ListingTab>('active');
  readonly listings = signal<readonly MyListing[]>([]);
  readonly toast = signal<ListingActionFeedback | null>(null);

  readonly filteredByTab = computed(() =>
    this.applyFilters(this.listings(), this.filters()).filter((item) => item.status === 'active')
  );

  readonly counts = computed<ListingCountByStatus>(() => {
    const all = this.applyFilters(this.listings(), this.filters());
    return {
      active: all.filter((item) => item.status === 'active').length,
      draft: 0,
      inactive: 0
    };
  });

  readonly isEmpty = computed(() => !this.loading() && this.filteredByTab().length === 0);

  loadListings(): void {
    this.loading.set(true);
    this.toast.set(null);
    this.repository
      .getMyListings()
      .pipe(
        catchError((error: unknown) => {
          this.toast.set({
            type: 'info',
            message: getErrorMessage(error, 'No se pudieron cargar tus publicaciones.')
          });
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((items) => {
        this.listings.set(items.map((item) => this.toMyListing(item)));
        this.toast.set(null);
      });
  }

  setFilters(nextFilters: MyListingsFilterState): void {
    this.filters.set(nextFilters);
  }

  clearFilters(): void {
    this.filters.set(MY_LISTINGS_DEFAULT_FILTERS);
  }

  setTab(tab: ListingTab): void {
    this.activeTab.set('active');
  }

  deactivate(id: string): void {
    this.actionLoadingId.set(id);
    this.repository
      .cancelListing(id)
      .pipe(
        catchError((error: unknown) => {
          this.toast.set({
            type: 'info',
            message: getErrorMessage(error, 'No se pudo cancelar la publicación.')
          });
          return EMPTY;
        }),
        finalize(() => this.actionLoadingId.set(null))
      )
      .subscribe(() => {
        this.listings.update((items) =>
          items.map((item) => (item.id === id ? { ...item, status: 'inactive' } : item))
        );
        this.toast.set({ type: 'info', message: MY_LISTINGS_COPY.deactivatedSuccess });
      });
  }

  restore(id: string): void {
    this.actionLoadingId.set(id);
    queueMicrotask(() => {
      this.actionLoadingId.set(null);
      this.listings.update((items) => items.map((item) => (item.id === id ? { ...item, status: 'active' } : item)));
      this.activeTab.set('active');
      this.toast.set({ type: 'info', message: MY_LISTINGS_COPY.restoredSuccess });
    });
  }

  showExportToast(): void {
    this.toast.set({ type: 'info', message: MY_LISTINGS_COPY.exportedSuccess });
  }

  showGeneratingRoutesToast(): void {
    this.toast.set({ type: 'info', message: 'Generando rutas de valor...' });
  }

  showMissingListingToast(): void {
    this.toast.set({ type: 'info', message: 'No se pudo identificar la publicación seleccionada.' });
  }

  clearToast(): void {
    this.toast.set(null);
  }

  private applyFilters(items: readonly MyListing[], filters: MyListingsFilterState): readonly MyListing[] {
    const query = filters.searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.specificResidue.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query);

      return (
        matchesQuery &&
        (filters.residueType === 'all' || item.residueType === filters.residueType) &&
        (filters.sector === 'all' || item.sector === filters.sector) &&
        (filters.productType === 'all' || item.productType === filters.productType) &&
        (!filters.specificResidue ||
          item.specificResidue.toLowerCase().includes(filters.specificResidue.toLowerCase())) &&
        item.status === 'active' &&
        filters.status === 'active' &&
        (filters.exchangeType === 'all' || item.exchangeType === filters.exchangeType)
      );
    });
  }

  private toMyListing(item: MarketplaceListing): MyListing {
    return {
      id: item.id,
      title: item.specificResidue,
      productType: item.productType,
      specificResidue: item.specificResidue,
      residueType: item.wasteType,
      sector: item.sector,
      quantity: item.quantity,
      unitLabel: item.unit,
      estimatedPriceLabel: item.pricePerUnitUsd === null ? 'A coordinar' : `USD ${item.pricePerUnitUsd.toFixed(2)}`,
      status:
        item.status === 'inactive'
          ? 'inactive'
          : item.status === 'draft'
            ? 'draft'
            : 'active',
      publishedAt: item.createdAt,
      exchangeType: item.exchangeType,
      exchangeLabel: this.mapExchangeLabel(item.exchangeType),
      location: item.location,
      imageUrl: item.media[0]?.url
    };
  }

  private mapExchangeLabel(value: MarketplaceListing['exchangeType']): string {
    switch (value) {
      case 'barter':
        return 'Trueque';
      case 'pickup':
        return 'Recojo';
      default:
        return 'Venta';
    }
  }
}
