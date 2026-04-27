import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ListingDetail } from '../../../core/models/app.models';
import { DEFAULT_FILTER_STATE, MARKETPLACE_MESSAGES } from '../data/marketplace.constants';
import {
  ActiveFilterChip,
  MarketplaceDataset,
  MarketplaceFilterState,
  MarketplaceListing,
  SearchState,
  SortOption
} from '../domain/marketplace.models';
import { MarketplaceRepository } from '../infrastructure/marketplace.repository';

@Injectable({ providedIn: 'root' })
export class MarketplaceFacade {
  private readonly repository = inject(MarketplaceRepository);

  readonly loading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly detailLoading = signal(false);
  readonly selectedDetail = signal<ListingDetail | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly dataset = signal<MarketplaceDataset>({ listings: [], recommended: [] });
  readonly listings = signal<readonly MarketplaceListing[]>([]);
  readonly filters = signal<MarketplaceFilterState>(DEFAULT_FILTER_STATE);
  readonly search = signal<SearchState>({
    query: '',
    sortBy: 'newest',
    viewMode: 'grid'
  });
  readonly currentPage = signal(1);
  readonly pageSize = 6;
  readonly total = signal(0);
  readonly hasMore = signal(true);

  private readonly requestInFlight = signal(false);

  readonly recommendedListings = computed(() => {
    const data = this.dataset();
    return data.recommended
      .map((recommended) => data.listings.find((listing) => listing.id === recommended.listingId) ?? null)
      .filter((item): item is MarketplaceListing => item !== null)
      .slice(0, 3);
  });

  readonly isEmpty = computed(() => !this.loading() && this.listings().length === 0 && !this.isDatasetEmpty());
  readonly isDatasetEmpty = computed(() => !this.loading() && this.dataset().listings.length === 0);

  readonly activeFilterChips = computed<readonly ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];
    const current = this.filters();

    if (current.wasteType !== 'all') {
      chips.push({ key: 'wasteType', label: current.wasteType === 'organic' ? 'Orgánico' : 'Inorgánico' });
    }
    if (current.sector !== 'all') {
      chips.push({ key: 'sector', label: this.mapSectorLabel(current.sector) });
    }
    if (current.exchangeType !== 'all') {
      chips.push({ key: 'exchangeType', label: this.mapExchangeLabel(current.exchangeType) });
    }
    if (current.immediateOnly) {
      chips.push({ key: 'immediateOnly', label: 'Disponibilidad inmediata' });
    }
    if (current.location) {
      chips.push({ key: 'location', label: current.location });
    }
    if (current.specificResidue) {
      chips.push({ key: 'specificResidue', label: current.specificResidue });
    }

    return chips;
  });

  loadMarketplace(): void {
    this.repository.getDataset().subscribe((dataset) => this.dataset.set(dataset));
    this.reloadFromStart();
  }

  setSearchAndFilters(query: string, nextFilters: MarketplaceFilterState): void {
    this.search.update((current) => ({ ...current, query }));
    this.filters.set(nextFilters);
    this.reloadFromStart();
  }

  setSort(sortBy: SortOption): void {
    this.search.update((current) => ({ ...current, sortBy }));
    this.reloadFromStart();
  }

  clearFilters(): void {
    this.filters.set(DEFAULT_FILTER_STATE);
    this.search.update((current) => ({ ...current, query: '', sortBy: 'newest' }));
    this.reloadFromStart();
  }

  removeChip(key: ActiveFilterChip['key']): void {
    const current = this.filters();
    const next: MarketplaceFilterState = {
      ...current,
      wasteType: key === 'wasteType' ? 'all' : current.wasteType,
      sector: key === 'sector' ? 'all' : current.sector,
      exchangeType: key === 'exchangeType' ? 'all' : current.exchangeType,
      immediateOnly: key === 'immediateOnly' ? false : current.immediateOnly,
      location: key === 'location' ? '' : current.location,
      specificResidue: key === 'specificResidue' ? '' : current.specificResidue
    };

    this.filters.set(next);
    this.reloadFromStart();
  }

  loadMore(): void {
    if (this.loading() || this.isLoadingMore() || this.requestInFlight() || !this.hasMore()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    this.fetchPage(nextPage, 'append');
  }

  saveSearch(): void {
    this.toastMessage.set(MARKETPLACE_MESSAGES.savedSearch);
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }

  loadDetail(id: string): void {
    this.detailLoading.set(true);
    this.repository
      .detail(id)
      .pipe(finalize(() => this.detailLoading.set(false)))
      .subscribe((data) => this.selectedDetail.set(data));
  }

  private reloadFromStart(): void {
    this.currentPage.set(1);
    this.total.set(0);
    this.hasMore.set(true);
    this.listings.set([]);
    this.fetchPage(1, 'replace');
  }

  private fetchPage(page: number, mode: 'replace' | 'append'): void {
    if (this.requestInFlight()) {
      return;
    }

    this.requestInFlight.set(true);
    if (mode === 'replace') {
      this.loading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this.repository
      .getListings({
        page,
        pageSize: this.pageSize,
        filters: this.filters(),
        query: this.search().query,
        sortBy: this.search().sortBy
      })
      .pipe(
        finalize(() => {
          this.requestInFlight.set(false);
          if (mode === 'replace') {
            this.loading.set(false);
          } else {
            this.isLoadingMore.set(false);
          }
        })
      )
      .subscribe((response) => {
        this.currentPage.set(response.page);
        this.total.set(response.total);
        this.hasMore.set(response.hasMore);

        if (mode === 'replace') {
          this.listings.set(response.items);
          return;
        }

        const seen = new Set(this.listings().map((item) => item.id));
        const merged = [...this.listings()];
        response.items.forEach((item) => {
          if (!seen.has(item.id)) {
            merged.push(item);
          }
        });
        this.listings.set(merged);
      });
  }

  private mapSectorLabel(value: MarketplaceFilterState['sector']): string {
    switch (value) {
      case 'agriculture':
        return 'Agrícola';
      case 'agroindustry':
        return 'Agroindustrial';
      case 'food':
        return 'Alimenticio';
      case 'metallurgical':
        return 'Metalúrgico';
      case 'industrial':
        return 'Industrial';
      default:
        return '';
    }
  }

  private mapExchangeLabel(value: MarketplaceFilterState['exchangeType']): string {
    switch (value) {
      case 'sale':
        return 'Venta';
      case 'barter':
        return 'Trueque';
      case 'pickup':
        return 'Recojo';
      default:
        return '';
    }
  }
}

