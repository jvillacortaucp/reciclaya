import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideCircleDollarSign, LucideMapPin, LucidePackagePlus } from '@lucide/angular';
import { SummaryPreviewData } from '../../../domain/purchase-preferences.models';

@Component({
  selector: 'app-active-summary-card',
  standalone: true,
  imports: [LucidePackagePlus, LucideCircleDollarSign, LucideMapPin],
  template: `
    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Resumen activo</p>
      <div class="mt-4 space-y-3">
        <div class="flex items-start gap-3">
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
            <svg lucidePackagePlus size="14"></svg>
          </span>
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[0.12em] text-slate-400">Material</p>
            <p class="truncate text-base font-medium text-slate-800">{{ summary?.materialLabel }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
            <svg lucideCircleDollarSign size="14"></svg>
          </span>
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[0.12em] text-slate-400">Volumen</p>
            <p class="truncate text-base font-medium text-slate-800">{{ summary?.volumeLabel }}</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
            <svg lucideMapPin size="14"></svg>
          </span>
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[0.12em] text-slate-400">Logística</p>
            <p class="text-sm font-medium leading-5 text-slate-800 break-words">{{ summary?.logisticsLabel }}</p>
          </div>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveSummaryCardComponent {
  @Input() summary: SummaryPreviewData | null = null;
}

