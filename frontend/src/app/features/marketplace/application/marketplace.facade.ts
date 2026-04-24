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
  readonly detailLoading = signal(false);
  readonly selectedDetail = signal<ListingDetail | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly dataset = signal<MarketplaceDataset>({ listings: [], recommended: [] });
  readonly filters = signal<MarketplaceFilterState>(DEFAULT_FILTER_STATE);
  readonly search = signal<SearchState>({
    query: '',
    sortBy: 'newest',
    viewMode: 'grid'
  });
  readonly currentPage = signal(1);
  readonly pageSize = 4;

  readonly recommendedListings = computed(() => {
    const data = this.dataset();
    return data.recommended
      .map((recommended) => data.listings.find((listing) => listing.id === recommended.listingId) ?? null)
      .filter((item): item is MarketplaceListing => item !== null)
      .slice(0, 3);
  });

  readonly filteredListings = computed(() => {
    const query = this.search().query.toLowerCase().trim();
    const filters = this.filters();

    let items = this.dataset().listings.filter((listing) => {
      const textMatch =
        !query ||
        listing.specificResidue.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.sector.toLowerCase().includes(query) ||
        listing.productType.toLowerCase().includes(query);

      const wasteTypeMatch = filters.wasteType === 'all' || listing.wasteType === filters.wasteType;
      const sectorMatch = filters.sector === 'all' || listing.sector === filters.sector;
      const productMatch = filters.productType === 'all' || listing.productType === filters.productType;
      const residueMatch =
        !filters.specificResidue ||
        listing.specificResidue.toLowerCase().includes(filters.specificResidue.toLowerCase());
      const exchangeMatch = filters.exchangeType === 'all' || listing.exchangeType === filters.exchangeType;
      const locationMatch =
        !filters.location || listing.location.toLowerCase().includes(filters.location.toLowerCase());
      const deliveryMatch = filters.deliveryMode === 'all' || listing.deliveryMode === filters.deliveryMode;
      const immediateMatch = !filters.immediateOnly || listing.immediateAvailability;
      const conditionMatch =
        filters.residueCondition === 'all' || listing.residueCondition === filters.residueCondition;
      const minPriceMatch = filters.minPrice === null || (listing.pricePerUnitUsd ?? 0) >= filters.minPrice;
      const maxPriceMatch = filters.maxPrice === null || (listing.pricePerUnitUsd ?? 0) <= filters.maxPrice;

      return (
        textMatch &&
        wasteTypeMatch &&
        sectorMatch &&
        productMatch &&
        residueMatch &&
        exchangeMatch &&
        locationMatch &&
        deliveryMatch &&
        immediateMatch &&
        conditionMatch &&
        minPriceMatch &&
        maxPriceMatch
      );
    });

    const sortBy = this.search().sortBy;
    items = this.sortListings(items, sortBy);
    return items;
  });

  readonly pagedListings = computed(() => {
    const end = this.currentPage() * this.pageSize;
    return this.filteredListings().slice(0, end);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredListings().length / this.pageSize)));
  readonly hasMore = computed(() => this.pagedListings().length < this.filteredListings().length);
  readonly isEmpty = computed(
    () => !this.loading() && this.dataset().listings.length > 0 && this.filteredListings().length === 0
  );
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
    this.loading.set(true);
    this.repository
      .getDataset()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((dataset) => {
        this.dataset.set(dataset);
      });
  }

  setSearchQuery(query: string): void {
    this.search.update((current) => ({ ...current, query }));
    this.currentPage.set(1);
  }

  setSort(sortBy: SortOption): void {
    this.search.update((current) => ({ ...current, sortBy }));
    this.currentPage.set(1);
  }

  updateFilters(nextFilters: MarketplaceFilterState): void {
    this.filters.set(nextFilters);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filters.set(DEFAULT_FILTER_STATE);
    this.search.update((current) => ({ ...current, query: '', sortBy: 'newest' }));
    this.currentPage.set(1);
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

    this.updateFilters(next);
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }

  loadMore(): void {
    if (!this.hasMore()) {
      return;
    }

    this.currentPage.update((value) => value + 1);
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

  private sortListings(listings: readonly MarketplaceListing[], sortBy: SortOption): MarketplaceListing[] {
    const sorted = [...listings];

    switch (sortBy) {
      case 'best_match':
        return sorted.sort((a, b) => b.matchScore - a.matchScore);
      case 'lowest_price':
        return sorted.sort((a, b) => (a.pricePerUnitUsd ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnitUsd ?? Number.MAX_SAFE_INTEGER));
      case 'highest_volume':
        return sorted.sort((a, b) => b.quantity - a.quantity);
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
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
