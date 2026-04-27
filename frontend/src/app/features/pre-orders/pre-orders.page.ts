import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { PreOrdersFacade } from './application/pre-orders.facade';

@Component({
  selector: 'app-pre-orders-page',
  imports: [SectionHeaderComponent, CardComponent, BadgeComponent],
  templateUrl: './presentation/pre-orders.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrdersPageComponent implements OnInit {
  private readonly facade = inject(PreOrdersFacade);

  protected readonly preOrders = this.facade.preOrders;
  protected readonly loading = this.facade.loading;

  ngOnInit(): void {
    this.facade.load();
  }
}
