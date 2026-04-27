import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { OrdersFacade } from './application/orders.facade';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [SectionHeaderComponent, CardComponent, BadgeComponent, RouterLink, DatePipe],
  templateUrl: './presentation/order-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(OrdersFacade);

  protected readonly order = this.facade.selectedOrder;
  protected readonly loading = this.facade.detailLoading;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.loadById(id);
    }
  }

  protected badgeStatus(status: string): 'success' | 'info' | 'warning' {
    if (status === 'paid' || status === 'completed' || status === 'approved') {
      return 'success';
    }

    if (status === 'cancelled' || status === 'rejected' || status === 'failed') {
      return 'warning';
    }

    return 'info';
  }
}
