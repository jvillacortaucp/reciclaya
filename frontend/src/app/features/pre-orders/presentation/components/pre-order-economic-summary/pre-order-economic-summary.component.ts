import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideBadgeDollarSign } from '@lucide/angular';
import { EconomicSummary } from '../../../domain/pre-order-screen.models';

const SAMPLE_ECONOMIC_SUMMARY: EconomicSummary = {
  unitPrice: 18.5,
  quantity: 10,
  subtotal: 18.5 * 10,
  logisticsFee: 25,
  adminFee: 0,
  total: 18.5 * 10 + 25 + 0,
  currency: 'PEN'
};

@Component({
  selector: 'app-pre-order-economic-summary',
  standalone: true,
  imports: [LucideBadgeDollarSign],
  template: `
    @if (summary) {
      <aside class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="text-2xl font-semibold text-slate-900">Resumen Económico</h3>

        <div class="mt-4 space-y-3 text-base">
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Precio Unitario</span>
            <strong class="text-slate-900">$ {{ summary.unitPrice }} / Ton</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Cantidad Pedida</span>
            <strong class="text-slate-900">{{ summary.quantity }} Ton</strong>
          </div>
          <div class="border-t border-slate-200 pt-3 flex items-center justify-between">
            <span class="text-slate-600">Subtotal</span>
            <strong class="text-slate-900">$ {{ summary.subtotal.toFixed(2) }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Servicio Logístico</span>
            <strong class="text-slate-900">$ {{ summary.logisticsFee.toFixed(2) }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Tarifa Admin</span>
            <strong class="text-emerald-700">Gratis (Premium)</strong>
          </div>
        </div>

        <div class="mt-5 border-t border-dashed border-slate-200 pt-4">
          <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Total referencial</p>
          <p class="mt-1 text-6xl font-bold text-emerald-700">$ {{ summary.total.toFixed(2) }}</p>
          <p class="text-sm text-slate-400 italic">Sujeto a confirmación de flete por el proveedor.</p>
        </div>

        <button
          type="button"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xl font-semibold text-white transition hover:bg-emerald-600"
        >
          <svg lucideBadgeDollarSign size="18"></svg>
          Simular Pago
        </button>
        <button
          type="button"
          class="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Descargar Cotización (PDF)
        </button>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderEconomicSummaryComponent {
  @Input() summary: EconomicSummary | null = SAMPLE_ECONOMIC_SUMMARY;
}

