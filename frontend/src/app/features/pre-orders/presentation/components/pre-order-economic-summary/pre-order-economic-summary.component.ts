import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCircleAlert, LucideDownload, LucideWalletCards } from '@lucide/angular';
import { PreOrderPricingSummary, SimulatedPaymentStatus } from '../../../models/pre-order.model';

@Component({
  selector: 'app-pre-order-economic-summary',
  standalone: true,
  imports: [LucideWalletCards, LucideDownload, LucideCircleAlert],
  template: `
    @if (summary) {
      <aside class="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <h3 class="text-2xl font-semibold text-slate-900 md:text-3xl">Resumen de Pre-orden</h3>

        <div class="mt-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Precio unitario</span>
            <strong class="text-sm text-slate-900 md:text-base">{{ currencySymbol }} {{ summary.unitPrice.toFixed(2) }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">Cantidad seleccionada</span>
            <strong class="text-sm text-slate-900 md:text-base">{{ summary.requestedQuantity.toFixed(1) }} {{ unitLabel }}</strong>
          </div>
          <div class="border-t border-slate-200 pt-3 flex items-center justify-between">
            <span class="text-sm text-slate-600">Subtotal</span>
            <strong class="text-sm text-slate-900 md:text-base">{{ currencySymbol }} {{ summary.subtotal.toFixed(2) }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1 text-sm text-slate-600">
              Comisión de servicio
              <svg lucideCircleAlert class="h-3.5 w-3.5 text-slate-400"></svg>
            </span>
            <strong class="text-sm text-slate-900 md:text-base">{{ currencySymbol }} {{ summary.serviceFee.toFixed(2) }}</strong>
          </div>
        </div>

        <div class="mt-5 rounded-2xl bg-slate-50 p-4">
          <p class="text-sm text-slate-600">Total estimado</p>
          <p class="mt-1 text-3xl font-bold text-emerald-700 md:text-4xl">{{ currencySymbol }} {{ summary.total.toFixed(2) }}</p>
        </div>

        <button
          type="button"
          [disabled]="paymentStatus === 'processing'"
          class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          (click)="simulatePayment.emit()"
        >
          <svg lucideWalletCards size="18"></svg>
          {{ paymentStatus === 'processing' ? 'Procesando pago...' : 'Pagar y generar pre-orden' }}
        </button>
        <button
          type="button"
          class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          (click)="downloadQuote.emit()"
        >
          <svg lucideDownload size="16"></svg>
          Descargar cotización (PDF)
        </button>

        <p class="mt-4 text-center text-sm text-slate-500">
          Este pago es simulado para fines del MVP. No se realizará ningún cargo real.
        </p>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderEconomicSummaryComponent {
  @Input() summary: PreOrderPricingSummary | null = null;
  @Input() unitLabel = 'Ton';
  @Input() paymentStatus: SimulatedPaymentStatus = 'idle';
  @Output() readonly simulatePayment = new EventEmitter<void>();
  @Output() readonly downloadQuote = new EventEmitter<void>();

  protected get currencySymbol(): string {
    return this.summary?.currency === 'PEN' ? 'S/' : '$';
  }
}
