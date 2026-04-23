import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PreOrder } from '../../../core/models/app.models';
import { PreOrdersRepository } from '../infrastructure/pre-orders.repository';

@Injectable({ providedIn: 'root' })
export class PreOrdersFacade {
  private readonly repository = inject(PreOrdersRepository);

  readonly loading = signal(false);
  readonly preOrders = signal<readonly PreOrder[]>([]);

  load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.preOrders.set(data));
  }

  create(preOrder: PreOrder): void {
    this.loading.set(true);
    this.repository
      .create(preOrder)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.load());
  }
}
