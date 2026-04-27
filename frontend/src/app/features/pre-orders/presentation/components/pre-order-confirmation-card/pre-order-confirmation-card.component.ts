import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideCircleCheckBig } from '@lucide/angular';
import { PreOrder } from '../../../models/pre-order.model';

@Component({
  selector: 'app-pre-order-confirmation-card',
  standalone: true,
  imports: [LucideCircleCheckBig],
  template: `
    @if (preOrder) {
      <article class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h4 class="flex items-center gap-2 text-base font-semibold text-emerald-700">
          <svg lucideCircleCheckBig class="h-4 w-4"></svg>
          Pre-orden enviada
        </h4>
        <p class="mt-2 text-sm text-emerald-800">Código: {{ preOrder.id }}</p>
        <p class="text-sm text-emerald-800">Estado: Pendiente de aprobación del proveedor</p>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderConfirmationCardComponent {
  @Input() preOrder: PreOrder | null = null;
}
