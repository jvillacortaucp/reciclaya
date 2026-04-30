import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { PreOrdersFacade } from './application/pre-orders.facade';
import { PreOrder } from '../../core/models/app.models';

@Component({
  selector: 'app-pre-orders-page',
  imports: [CommonModule, SectionHeaderComponent, CardComponent, BadgeComponent],
  templateUrl: './presentation/pre-orders.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrdersPageComponent implements OnInit {
  private readonly facade = inject(PreOrdersFacade);
  private readonly selectedPreOrderId = signal<string | null>(null);

  protected readonly preOrders = this.facade.preOrders;
  protected readonly loading = this.facade.loading;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly selectedPreOrder = computed(() =>
    this.preOrders().find((item) => item.id === this.selectedPreOrderId()) ?? null
  );

  ngOnInit(): void {
    this.facade.load();
  }

  protected viewPurchase(item: PreOrder): void {
    this.selectedPreOrderId.set(item.id);
  }

  protected downloadInvoice(item: PreOrder): void {
    if (!item?.id) return;
    this.facade.downloadQuotationPdf(item.id);
  }

  protected clearSelection(): void {
    this.selectedPreOrderId.set(null);
  }

  protected formatStatus(status: PreOrder['status']): string {
    switch (status) {
      case 'submitted':
        return 'Enviada';
      case 'approved':
        return 'Aprobada';
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Borrador';
    }
  }
}
