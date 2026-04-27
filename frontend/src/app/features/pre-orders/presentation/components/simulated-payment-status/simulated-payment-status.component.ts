import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideCircleAlert, LucideCircleCheckBig, LucideLoaderCircle } from '@lucide/angular';
import { SimulatedPaymentStatus } from '../../../models/pre-order.model';

@Component({
  selector: 'app-simulated-payment-status',
  standalone: true,
  imports: [LucideLoaderCircle, LucideCircleCheckBig, LucideCircleAlert],
  template: `
    @if (status !== 'idle') {
      <div
        class="rounded-2xl border p-3 text-sm"
        [class.border-emerald-200]="status === 'success'"
        [class.bg-emerald-50]="status === 'success'"
        [class.text-emerald-700]="status === 'success'"
        [class.border-slate-200]="status === 'processing'"
        [class.bg-slate-50]="status === 'processing'"
        [class.text-slate-700]="status === 'processing'"
        [class.border-rose-200]="status === 'failed'"
        [class.bg-rose-50]="status === 'failed'"
        [class.text-rose-700]="status === 'failed'"
      >
        <div class="flex items-center gap-2">
          @if (status === 'processing') {
            <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
          } @else if (status === 'success') {
            <svg lucideCircleCheckBig class="h-4 w-4"></svg>
          } @else {
            <svg lucideCircleAlert class="h-4 w-4"></svg>
          }
          <span>{{ message }}</span>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatedPaymentStatusComponent {
  @Input() status: SimulatedPaymentStatus = 'idle';
  @Input() processingMessage = 'Procesando pago simulado...';
  @Input() successMessage = 'Pago simulado exitoso. Pre-orden generada.';
  @Input() failedMessage = 'La simulación falló. Intente nuevamente.';

  protected get message(): string {
    if (this.status === 'processing') {
      return this.processingMessage;
    }
    if (this.status === 'success') {
      return this.successMessage;
    }
    return this.failedMessage;
  }
}
