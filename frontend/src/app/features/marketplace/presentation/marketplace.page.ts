import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LucideBookmark, LucideInfo, LucidePlus, LucideSlidersHorizontal } from '@lucide/angular';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
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

@Component({
  selector: 'app-marketplace-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EmptyStateComponent,
    MarketplaceFiltersComponent,
    RecommendedListingCardComponent,
    MarketplaceProductCardComponent,
    LucideBookmark,
    LucideSlidersHorizontal,
    LucidePlus,
    LucideInfo
  ],
  templateUrl: './marketplace.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(MarketplaceFacade);
  private readonly fb = inject(FormBuilder);
  private readonly subscriptions = new Subscription();
  private observer: IntersectionObserver | null = null;

  @ViewChild('infiniteScrollSentinel') private sentinelRef?: ElementRef<HTMLDivElement>;
  protected readonly filtersOpen = signal(false);

  protected readonly copy = MARKETPLACE_COPY;
  protected readonly messages = MARKETPLACE_MESSAGES;
  protected readonly wasteTypeOptions = WASTE_TYPE_FILTER_OPTIONS;
  protected readonly sectorOptions = SECTOR_FILTER_OPTIONS;
  protected readonly exchangeOptions = EXCHANGE_FILTER_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly loading = this.facade.loading;
  protected readonly isLoadingMore = this.facade.isLoadingMore;
  protected readonly listings = this.facade.listings;
  protected readonly recommendedListings = this.facade.recommendedListings;
  protected readonly hasMore = this.facade.hasMore;
  protected readonly isEmpty = this.facade.isEmpty;
  protected readonly isDatasetEmpty = this.facade.isDatasetEmpty;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly chips = this.facade.activeFilterChips;
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
        this.facade.setSearchAndFilters(value.query ?? '', {
          ...this.facade.filters(),
          wasteType: value.wasteType ?? 'all',
          sector: value.sector ?? 'all',
          exchangeType: value.exchangeType ?? 'all'
        });
      })
    );
  }

  ngAfterViewInit(): void {
    this.setupInfiniteObserver();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.observer?.disconnect();
    this.observer = null;
  }

  protected saveSearch(): void {
    this.facade.saveSearch();
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((value) => !value);
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

  protected loadMore(): void {
    this.facade.loadMore();
  }

  private setupInfiniteObserver(): void {
    const sentinel = this.sentinelRef?.nativeElement;
    if (!sentinel) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        this.loadMore();
      },
      {
        root: null,
        rootMargin: '220px',
        threshold: 0
      }
    );

    this.observer.observe(sentinel);
  }
}
