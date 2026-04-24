import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideMessageCircle, LucideSend } from '@lucide/angular';
import { ListingDetailEntity } from '../../../domain/listing-detail.models';

@Component({
  selector: 'app-listing-summary-card',
  standalone: true,
  imports: [LucideSend, LucideMessageCircle],
  template: `
    @if (detail) {
      <aside class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="rounded-2xl bg-slate-950 p-4 text-slate-100">
          <p class="text-xs uppercase tracking-[0.12em] text-slate-300">Resumen de oferta</p>
          <h3 class="mt-2 text-3xl font-semibold leading-tight">{{ detail.subtitle }}</h3>
        </div>

        <div class="mt-4 space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.1em] text-slate-400">Cantidad total</p>
            <p class="text-5xl font-semibold text-slate-900">
              {{ detail.volume.amount }}
              <span class="text-3xl text-slate-400">{{ detail.volume.unit === 'tons' ? 'Toneladas' : detail.volume.unit }}</span>
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.1em] text-slate-400">Costo unitario</p>
            <p class="text-5xl font-semibold text-slate-900">
              USD {{ detail.pricing.costPerUnit }}
              <span class="text-2xl text-slate-400">/ {{ detail.volume.unit === 'tons' ? 'Ton' : detail.volume.unit }}</span>
            </p>
          </div>

          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p class="text-xs uppercase tracking-[0.08em] text-emerald-700">Valor estimado</p>
            <p class="text-5xl font-bold text-emerald-700">USD {{ detail.pricing.estimatedTotal }}</p>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-700"
            (click)="contact.emit()"
          >
            <svg lucideSend size="16"></svg>
            {{ primaryActionLabel }}
          </button>
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg lucideMessageCircle size="16"></svg>
            {{ secondaryActionLabel }}
          </button>
        </div>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingSummaryCardComponent {
  @Input() detail: ListingDetailEntity | null = null;
  @Input() primaryActionLabel = 'Contactar vendedor';
  @Input() secondaryActionLabel = 'Solicitar información';
  @Output() readonly contact = new EventEmitter<void>();
}
