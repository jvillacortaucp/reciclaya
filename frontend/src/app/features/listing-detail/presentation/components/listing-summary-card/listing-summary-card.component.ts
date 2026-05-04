import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideSend } from '@lucide/angular';
import { ListingDetailEntity } from '../../../domain/listing-detail.models';

@Component({
  selector: 'app-listing-summary-card',
  standalone: true,
  imports: [LucideSend],
  template: `
    @if (detail) {
      <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-5">
        <div class="rounded-2xl bg-slate-950 p-4 text-slate-100">
          <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Resumen de oferta</p>
          <h3 class="mt-2 line-clamp-2 break-all text-xl font-semibold leading-tight md:text-2xl">{{ detail.subtitle }}</h3>
        </div>

        <div class="mt-4 space-y-4">
          <div>
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">Cantidad total</p>
            <p class="wrap-break-words text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              {{ detail.volume.amount }}
              <span class="text-lg text-slate-400 md:text-xl">{{ detail.volume.unit === 'tons' ? 'Toneladas' : detail.volume.unit }}</span>
            </p>
          </div>

          <div>
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-400">Costo unitario</p>
            <p class="wrap-break-words text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              S/ {{ detail.pricing.costPerUnit }}
              <span class="text-lg text-slate-400 md:text-xl">/ {{ detail.volume.unit === 'tons' ? 'Ton' : detail.volume.unit }}</span>
            </p>
          </div>

          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p class="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Valor estimado</p>
            <p class="wrap-break-words text-3xl font-bold leading-tight text-emerald-700 md:text-4xl">S/ {{ detail.pricing.estimatedTotal }}</p>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <button
            type="button"
            class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
            (click)="contact.emit()"
          >
            <svg lucideSend class="h-4 w-4"></svg>
            {{ primaryActionLabel }}
          </button>
        </div>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingSummaryCardComponent {
  @Input() detail: ListingDetailEntity | null = null;
  @Input() primaryActionLabel = 'Generar Orden';
  @Input() secondaryActionLabel = 'Solicitar información';
  @Output() readonly contact = new EventEmitter<void>();
  @Output() readonly requestInfo = new EventEmitter<void>();
}
