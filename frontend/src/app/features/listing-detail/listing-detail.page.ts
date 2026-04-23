import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { MarketplaceFacade } from '../marketplace/application/marketplace.facade';

@Component({
  selector: 'app-listing-detail-page',
  imports: [SectionHeaderComponent, CardComponent, EmptyStateComponent, RouterLink],
  templateUrl: './presentation/listing-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(MarketplaceFacade);

  protected readonly detail = this.facade.selectedDetail;
  protected readonly loading = this.facade.loading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadDetail(id);
    }
  }
}
