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
      class="w-full rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-200/60 flex flex-col justify-between h-full select-none select-none relative group animate-fade-in-up">
      <div>
        <div class="mb-5 flex items-center justify-between">
          <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 text-emerald-600 border border-emerald-100 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-emerald-50">
            @switch (suggestion().iconName) {
              @case ('flask-conical') { <svg lucideFlaskConical class="h-5 w-5"></svg> }
              @case ('recycle') { <svg lucideRecycle class="h-5 w-5"></svg> }
              @case ('sprout') { <svg lucideSprout class="h-5 w-5"></svg> }
              @case ('flame') { <svg lucideFlame class="h-5 w-5"></svg> }
              @default { <svg lucideWheat class="h-5 w-5"></svg> }
            }
          </span>
        </div>

        <h4 class="line-clamp-2 text-xl font-bold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors duration-300 sm:text-2xl">
          {{ suggestion().productName }}
        </h4>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {{ suggestion().sectorName }}
        </p>
        <p class="mt-3.5 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {{ suggestion().description }}
        </p>
      </div>

      <div class="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border" [class]="complexityStyles[suggestion().complexity]">
            {{ complexityLabels[suggestion().complexity] }}
          </span>
          <span class="rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border" [class]="potentialStyles[suggestion().marketPotential]">
            {{ potentialLabels[suggestion().marketPotential] }}
          </span>
          <span class="rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-100">
            Estimado preliminar
          </span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-100 w-full sm:w-auto text-center"
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

