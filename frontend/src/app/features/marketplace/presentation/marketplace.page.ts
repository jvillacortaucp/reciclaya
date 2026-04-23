import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { FilterChipComponent } from '../../../shared/ui/filter-chip/filter-chip.component';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { MarketplaceFacade } from '../application/marketplace.facade';

@Component({
  selector: 'app-marketplace-page',
  imports: [SectionHeaderComponent, FilterChipComponent, CardComponent, BadgeComponent, EmptyStateComponent, RouterLink],
  templateUrl: './marketplace.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePageComponent implements OnInit {
  private readonly facade = inject(MarketplaceFacade);
  protected readonly listings = this.facade.listings;
  protected readonly loading = this.facade.loading;

  ngOnInit(): void {
    this.facade.loadListings();
  }
}
