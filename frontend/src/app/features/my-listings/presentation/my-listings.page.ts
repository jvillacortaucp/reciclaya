import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LucideFilter,
  LucideInfo,
  LucideLoaderCircle,
  LucidePlusCircle,
  LucideSparkles
} from '@lucide/angular';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { MyListingsFacade } from '../application/my-listings.facade';
import {
  MY_LISTINGS_COPY,
  MY_LISTINGS_DEFAULT_FILTERS,
  MY_LISTINGS_EXCHANGE_OPTIONS,
  MY_LISTINGS_FLOATING_ACTIONS,
  MY_LISTINGS_PRODUCT_OPTIONS,
  MY_LISTINGS_RESIDUE_TYPE_OPTIONS,
  MY_LISTINGS_SECTOR_OPTIONS,
  MY_LISTINGS_STATUS_OPTIONS,
  MY_LISTINGS_TAB_OPTIONS
} from '../data/my-listings.constants';
import { ListingTab } from '../domain/my-listing.model';
import { FloatingActionsComponent } from './components/floating-actions.component';
import { MyListingCardComponent } from './components/my-listing-card.component';
import { MyListingsFiltersComponent } from './components/my-listings-filters.component';

@Component({
  selector: 'app-my-listings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
    MyListingCardComponent,
    MyListingsFiltersComponent,
    FloatingActionsComponent,
    LucideFilter,
    LucideInfo,
    LucideLoaderCircle,
    LucidePlusCircle,
    LucideSparkles
  ],
  templateUrl: './my-listings.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyListingsPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly facade = inject(MyListingsFacade);
  private readonly subscriptions = new Subscription();

  protected readonly copy = MY_LISTINGS_COPY;
  protected readonly tabOptions = MY_LISTINGS_TAB_OPTIONS;
  protected readonly residueTypeOptions = MY_LISTINGS_RESIDUE_TYPE_OPTIONS;
  protected readonly sectorOptions = MY_LISTINGS_SECTOR_OPTIONS;
  protected readonly productOptions = MY_LISTINGS_PRODUCT_OPTIONS;
  protected readonly statusOptions = MY_LISTINGS_STATUS_OPTIONS;
  protected readonly exchangeOptions = MY_LISTINGS_EXCHANGE_OPTIONS;
  protected readonly floatingActions = MY_LISTINGS_FLOATING_ACTIONS;

  protected readonly loading = this.facade.loading;
  protected readonly actionLoadingId = this.facade.actionLoadingId;
  protected readonly activeTab = this.facade.activeTab;
  protected readonly listings = this.facade.filteredByTab;
  protected readonly counts = this.facade.counts;
  protected readonly isEmpty = this.facade.isEmpty;
  protected readonly toast = this.facade.toast;

  protected readonly filtersOpen = signal(false);

  protected readonly filtersForm = this.fb.nonNullable.group({
    residueType: [MY_LISTINGS_DEFAULT_FILTERS.residueType],
    sector: [MY_LISTINGS_DEFAULT_FILTERS.sector],
    productType: [MY_LISTINGS_DEFAULT_FILTERS.productType],
    specificResidue: [MY_LISTINGS_DEFAULT_FILTERS.specificResidue],
    status: [MY_LISTINGS_DEFAULT_FILTERS.status],
    exchangeType: [MY_LISTINGS_DEFAULT_FILTERS.exchangeType],
    publishedDate: [MY_LISTINGS_DEFAULT_FILTERS.publishedDate]
  });

  ngOnInit(): void {
    this.facade.loadListings();
    this.subscriptions.add(
      this.filtersForm.valueChanges.subscribe((value) => {
        this.facade.setFilters({
          residueType: value.residueType ?? MY_LISTINGS_DEFAULT_FILTERS.residueType,
          sector: value.sector ?? MY_LISTINGS_DEFAULT_FILTERS.sector,
          productType: value.productType ?? MY_LISTINGS_DEFAULT_FILTERS.productType,
          specificResidue: value.specificResidue ?? MY_LISTINGS_DEFAULT_FILTERS.specificResidue,
          status: value.status ?? MY_LISTINGS_DEFAULT_FILTERS.status,
          exchangeType: value.exchangeType ?? MY_LISTINGS_DEFAULT_FILTERS.exchangeType,
          publishedDate: value.publishedDate ?? MY_LISTINGS_DEFAULT_FILTERS.publishedDate
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((value) => !value);
  }

  protected clearFilters(): void {
    this.filtersForm.reset(MY_LISTINGS_DEFAULT_FILTERS);
    this.facade.clearFilters();
  }

  protected setTab(tab: ListingTab): void {
    this.facade.setTab(tab);
  }

  protected editListing(id: string): void {
    this.router.navigate(['/app/waste-sell'], { queryParams: { edit: id } });
  }

  protected deactivateListing(id: string): void {
    this.facade.deactivate(id);
  }

  protected restoreListing(id: string): void {
    this.facade.restore(id);
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected onFloatingAction(action: 'new' | 'value-sector' | 'export' | 'marketplace'): void {
    if (action === 'new') {
      this.router.navigate(['/app/waste-sell']);
      return;
    }

    if (action === 'value-sector') {
      this.router.navigate(['/app/value-sector']);
      return;
    }

    if (action === 'marketplace') {
      this.router.navigate(['/app/marketplace']);
      return;
    }

    this.facade.showExportToast();
  }
}

