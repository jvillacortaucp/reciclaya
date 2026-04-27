import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { OrdersFacade } from './application/orders.facade';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [SectionHeaderComponent, CardComponent, BadgeComponent, RouterLink, DatePipe],
  templateUrl: './presentation/orders.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPageComponent implements OnInit {
  private readonly facade = inject(OrdersFacade);

  protected readonly title = this.facade.title;
  protected readonly orders = this.facade.orders;
  protected readonly loading = this.facade.loading;
  protected readonly toastMessage = this.facade.toastMessage;

  ngOnInit(): void {
    this.facade.load();
  }

  protected badgeStatus(status: string): 'success' | 'info' | 'warning' {
    if (status === 'paid' || status === 'completed') {
      return 'success';
    }

    if (status === 'cancelled') {
      return 'warning';
    }

    return 'info';
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }
}
