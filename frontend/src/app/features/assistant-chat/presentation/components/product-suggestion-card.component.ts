import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideCheck,
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
  imports: [LucideCheck, LucideWheat, LucideFlaskConical, LucideRecycle, LucideSprout, LucideFlame],
  template: `
    <button
      type="button"
      class="w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-5"
      [class.border-emerald-500]="selected()"
      [class.bg-emerald-50]="selected()"
      [class.ring-2]="selected()"
      [class.ring-emerald-100]="selected()"
      [class.border-slate-200]="!selected()"
      (click)="picked.emit(suggestion())">
      <div class="mb-5 flex items-center justify-between">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500" [class.bg-emerald-100]="selected()" [class.text-emerald-700]="selected()">
          @switch (suggestion().iconName) {
            @case ('flask-conical') { <svg lucideFlaskConical class="h-5 w-5"></svg> }
            @case ('recycle') { <svg lucideRecycle class="h-5 w-5"></svg> }
            @case ('sprout') { <svg lucideSprout class="h-5 w-5"></svg> }
            @case ('flame') { <svg lucideFlame class="h-5 w-5"></svg> }
            @default { <svg lucideWheat class="h-5 w-5"></svg> }
          }
        </span>
        @if (selected()) {
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg lucideCheck class="h-4 w-4"></svg>
          </span>
        }
      </div>

      <h4 class="line-clamp-2 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">{{ suggestion().productName }}</h4>
      <p class="mt-1 text-sm text-slate-500 sm:text-base">{{ suggestion().sectorName }}</p>
      <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700 sm:text-base">{{ suggestion().description }}</p>

      <div class="mt-5 border-t border-slate-200 pt-4">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="complexityStyles[suggestion().complexity]">
            {{ complexityLabels[suggestion().complexity] }}
          </span>
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="potentialStyles[suggestion().marketPotential]">
            {{ potentialLabels[suggestion().marketPotential] }}
          </span>
        </div>
      </div>
    </button>
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
