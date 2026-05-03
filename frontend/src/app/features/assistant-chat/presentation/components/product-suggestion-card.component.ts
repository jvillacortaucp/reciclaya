import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideFlame,
  LucideFlaskConical,
  LucideRecycle,
  LucideSprout,
  LucideWheat
} from '@lucide/angular';
import {
  COMPLEXITY_LABELS,
  COMPLEXITY_STYLES,
  MARKET_POTENTIAL_LABELS,
  POTENTIAL_STYLES
} from '../../data/assistant-chat.constants';
import { ProductSuggestion } from '../../models/assistant-chat.model';

@Component({
  selector: 'app-product-suggestion-card',
  standalone: true,
  imports: [LucideWheat, LucideFlaskConical, LucideRecycle, LucideSprout, LucideFlame],
  template: `
    <div
      class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-5">
      <div class="mb-5 flex items-center justify-between">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          @switch (suggestion().iconName) {
            @case ('flask-conical') { <svg lucideFlaskConical class="h-5 w-5"></svg> }
            @case ('recycle') { <svg lucideRecycle class="h-5 w-5"></svg> }
            @case ('sprout') { <svg lucideSprout class="h-5 w-5"></svg> }
            @case ('flame') { <svg lucideFlame class="h-5 w-5"></svg> }
            @default { <svg lucideWheat class="h-5 w-5"></svg> }
          }
        </span>
      </div>

      <h4 class="line-clamp-2 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">{{ suggestion().productName }}</h4>
      <p class="mt-1 text-sm text-slate-500 sm:text-base">{{ suggestion().sectorName }}</p>
      <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700 sm:text-base">{{ suggestion().description }}</p>

      <div class="mt-5 flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="complexityStyles[suggestion().complexity]">
            {{ complexityLabels[suggestion().complexity] }}
          </span>
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="potentialStyles[suggestion().marketPotential]">
            {{ potentialLabels[suggestion().marketPotential] }}
          </span>
          <span class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-slate-600">
            estimado preliminar
          </span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 w-full sm:w-auto text-center"
          (click)="picked.emit(suggestion())">
          Ver proceso
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSuggestionCardComponent {
  suggestion = input.required<ProductSuggestion>();
  selected = input<boolean>(false);
  picked = output<ProductSuggestion>();

  protected readonly complexityLabels = COMPLEXITY_LABELS;
  protected readonly complexityStyles = COMPLEXITY_STYLES;
  protected readonly potentialLabels = MARKET_POTENTIAL_LABELS;
  protected readonly potentialStyles = POTENTIAL_STYLES;
}
