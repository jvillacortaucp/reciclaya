import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { AuthFacade } from '../../auth/services/auth.facade';
import { OrderDetail, OrderListItem } from '../domain/orders.models';
import { OrdersHttpRepository } from '../infrastructure/orders-http.repository';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  private readonly repository = inject(OrdersHttpRepository);
  private readonly authFacade = inject(AuthFacade);

  readonly loading = signal(false);
  readonly detailLoading = signal(false);
  readonly orders = signal<readonly OrderListItem[]>([]);
  readonly selectedOrder = signal<OrderDetail | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly title = computed(() => {
    const role = this.authFacade.user()?.role;
    if (role === 'buyer') {
      return 'Mis compras';
    }

    if (role === 'seller') {
      return 'Ventas recibidas';
    }

    return 'Ordenes';
  });

  load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudieron cargar las ordenes.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((orders) => this.orders.set(orders));
  }

  loadById(id: string): void {
    this.detailLoading.set(true);
    this.repository
      .getById(id)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo cargar la orden.'));
          return EMPTY;
        }),
        finalize(() => this.detailLoading.set(false))
      )
      .subscribe((order) => this.selectedOrder.set(order));
  }

  clearToast(): void {
    this.toastMessage.set(null);
  }
}
