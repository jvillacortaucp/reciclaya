import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LucideBookmark, LucideInfo, LucidePlus, LucideRefreshCcw } from '@lucide/angular';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import {
  EXCHANGE_FILTER_OPTIONS,
  MARKETPLACE_COPY,
  MARKETPLACE_MESSAGES,
  SECTOR_FILTER_OPTIONS,
  SORT_OPTIONS,
  WASTE_TYPE_FILTER_OPTIONS
} from '../data/marketplace.constants';
import { ActiveFilterChip, MarketplaceFilterState, SortOption } from '../domain/marketplace.models';
import { MarketplaceFacade } from '../application/marketplace.facade';
import { MarketplaceFiltersComponent } from './components/marketplace-filters/marketplace-filters.component';
import { RecommendedListingCardComponent } from './components/recommended-listing-card/recommended-listing-card.component';
import { MarketplaceProductCardComponent } from './components/marketplace-product-card/marketplace-product-card.component';
import { MarketplacePaginationComponent } from './components/marketplace-pagination/marketplace-pagination.component';

@Component({
  selector: 'app-marketplace-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SectionHeaderComponent,
    EmptyStateComponent,
    MarketplaceFiltersComponent,
    RecommendedListingCardComponent,
    MarketplaceProductCardComponent,
    MarketplacePaginationComponent,
    LucideBookmark,
    LucideRefreshCcw,
    LucidePlus,
    LucideInfo
  ],
  templateUrl: './marketplace.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePageComponent implements OnInit, OnDestroy {
  private readonly facade = inject(MarketplaceFacade);
  private readonly fb = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  protected readonly copy = MARKETPLACE_COPY;
  protected readonly messages = MARKETPLACE_MESSAGES;
  protected readonly wasteTypeOptions = WASTE_TYPE_FILTER_OPTIONS;
  protected readonly sectorOptions = SECTOR_FILTER_OPTIONS;
  protected readonly exchangeOptions = EXCHANGE_FILTER_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly loading = this.facade.loading;
  protected readonly filteredListings = this.facade.filteredListings;
  protected readonly pagedListings = this.facade.pagedListings;
  protected readonly recommendedListings = this.facade.recommendedListings;
  protected readonly isEmpty = this.facade.isEmpty;
  protected readonly isDatasetEmpty = this.facade.isDatasetEmpty;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly chips = this.facade.activeFilterChips;
  protected readonly totalPages = this.facade.totalPages;
  protected readonly currentPage = this.facade.currentPage;
  protected readonly sortValue = this.facade.search;

  protected readonly filtersForm = this.fb.nonNullable.group({
    query: [''],
    wasteType: ['all' as MarketplaceFilterState['wasteType']],
    sector: ['all' as MarketplaceFilterState['sector']],
    exchangeType: ['all' as MarketplaceFilterState['exchangeType']]
  });

  ngOnInit(): void {
    this.facade.loadMarketplace();

    this.subscriptions.add(
      this.filtersForm.valueChanges.subscribe((value) => {
        this.facade.setSearchQuery(value.query ?? '');
        this.facade.updateFilters({
          ...this.facade.filters(),
          wasteType: value.wasteType ?? 'all',
          sector: value.sector ?? 'all',
          exchangeType: value.exchangeType ?? 'all'
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected saveSearch(): void {
    this.facade.saveSearch();
  }

  protected clearFilters(): void {
    this.facade.clearFilters();
    this.filtersForm.reset({
      query: '',
      wasteType: 'all',
      sector: 'all',
      exchangeType: 'all'
    });
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected removeChip(key: ActiveFilterChip['key']): void {
    this.facade.removeChip(key);
  }

  protected setSort(option: SortOption): void {
    this.facade.setSort(option);
  }

  protected changePage(page: number): void {
    this.facade.setPage(page);
  }
}

