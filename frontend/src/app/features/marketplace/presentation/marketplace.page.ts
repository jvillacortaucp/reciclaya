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
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LucideInfo, LucidePlus, LucideSlidersHorizontal } from '@lucide/angular';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { ProtectedActionService } from '../../../core/services/protected-action.service';
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
    LucideSlidersHorizontal,
    LucidePlus,
    LucideInfo
  ],
  templateUrl: './marketplace.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(MarketplaceFacade);
  private readonly protectedActions = inject(ProtectedActionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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
  protected readonly routes = APP_ROUTES;

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
    const initialQuery = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.filtersForm.patchValue({ query: initialQuery }, { emitEvent: false });
    this.facade.loadMarketplace(initialQuery);

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

    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const nextQuery = params.get('q') ?? '';
        if (this.filtersForm.controls.query.value === nextQuery) {
          return;
        }

        this.filtersForm.patchValue({ query: nextQuery }, { emitEvent: false });
        this.facade.setSearchAndFilters(nextQuery, {
          ...this.facade.filters(),
          wasteType: this.filtersForm.controls.wasteType.value ?? 'all',
          sector: this.filtersForm.controls.sector.value ?? 'all',
          exchangeType: this.filtersForm.controls.exchangeType.value ?? 'all'
        });
      })
    );
  }

  ngAfterViewInit(): void {
    this.setupInfiniteObserver();

    // Si el sentinel aún no está en el DOM (por ejemplo cuando la lista está vacía
    // en el primer render), reintentamos observar periódicamente hasta que exista
    // o hasta que el componente se destruya.
    if (!this.sentinelRef?.nativeElement) {
      const handle = setInterval(() => {
        if (this.sentinelRef?.nativeElement) {
          this.setupInfiniteObserver();
          clearInterval(handle);
        }
      }, 300);

      this.subscriptions.add(new Subscription(() => clearInterval(handle)));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.observer?.disconnect();
    this.observer = null;
  }

  protected saveSearch(): void {
    this.protectedActions.requireAuthForAction({
      actionName: 'Guardar búsqueda',
      returnUrl: this.router.url,
      onAllowed: () => this.facade.saveSearch()
    });
  }

  protected publishWaste(): void {
    this.protectedActions.requireAuthForAction({
      actionName: 'Publicar residuo',
      returnUrl: APP_ROUTES.wasteSell,
      onAllowed: () => {
        void this.router.navigateByUrl(APP_ROUTES.wasteSell);
      }
    });
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
