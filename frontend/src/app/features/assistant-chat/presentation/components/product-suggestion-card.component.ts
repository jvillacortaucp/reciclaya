import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import {
  LucideBanknote,
  LucideFactory,
  LucideFlame,
  LucideFlaskConical,
  LucideGift,
  LucideLeaf,
  LucideRecycle,
  LucideSprout,
  LucideWheat,
  LucideWrench,
  LucideChevronDown,
  LucideChevronUp
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
  imports: [
    LucideWheat, LucideFlaskConical, LucideRecycle, LucideSprout, LucideFlame,
    LucideBanknote, LucideFactory, LucideGift, LucideLeaf, LucideWrench,
    LucideChevronDown, LucideChevronUp
  ],
  template: `
    <div
      class="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-7">

      <!-- Header: icon + monetizable badge -->
      <div class="mb-4 flex items-center justify-between">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          @switch (suggestion().iconName) {
            @case ('flask-conical') { <svg lucideFlaskConical class="h-5 w-5"></svg> }
            @case ('recycle') { <svg lucideRecycle class="h-5 w-5"></svg> }
            @case ('sprout') { <svg lucideSprout class="h-5 w-5"></svg> }
            @case ('flame') { <svg lucideFlame class="h-5 w-5"></svg> }
            @case ('cash') { <svg lucideBanknote class="h-5 w-5"></svg> }
            @case ('leaf') { <svg lucideLeaf class="h-5 w-5"></svg> }
            @case ('tools') { <svg lucideWrench class="h-5 w-5"></svg> }
            @case ('gift') { <svg lucideGift class="h-5 w-5"></svg> }
            @case ('factory') { <svg lucideFactory class="h-5 w-5"></svg> }
            @default { <svg lucideWheat class="h-5 w-5"></svg> }
          }
        </span>
        @if (suggestion().monetizable) {
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            💰 Monetizable
          </span>
        } @else {
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
            ♻️ No monetizable
          </span>
        }
      </div>

      <!-- Title + sector -->
      <h4 class="line-clamp-2 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">{{ suggestion().productName }}</h4>
      <p class="mt-1 text-sm text-slate-500 sm:text-base">{{ suggestion().sectorName }}</p>
      <p class="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700 sm:text-base">{{ suggestion().description }}</p>

      <!-- Monetary info row -->
      @if (suggestion().estimatedValue && suggestion().estimatedValue !== 'No definido') {
        <div class="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">💵</span>
            <div>
              <p class="text-xs font-medium text-slate-500">Valor estimado</p>
              <p class="text-sm font-bold text-emerald-700">{{ suggestion().estimatedValue }}</p>
            </div>
          </div>
          @if (suggestion().timeToMoney && suggestion().timeToMoney !== 'n/a') {
            <div class="flex items-center gap-2 border-l border-emerald-200 pl-3">
              <span class="text-lg">⏱️</span>
              <div>
                <p class="text-xs font-medium text-slate-500">Tiempo</p>
                <p class="text-sm font-semibold text-slate-700">{{ suggestion().timeToMoney }}</p>
              </div>
            </div>
          }
          @if (suggestion().minQuantity && suggestion().minQuantity !== 'n/a') {
            <div class="flex items-center gap-2 border-l border-emerald-200 pl-3">
              <span class="text-lg">📦</span>
              <div>
                <p class="text-xs font-medium text-slate-500">Mín. cantidad</p>
                <p class="text-sm font-semibold text-slate-700">{{ suggestion().minQuantity }}</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- Difficulty -->
      @if (suggestion().difficulty) {
        <p class="mt-3 text-xs leading-relaxed text-slate-500 italic">
          📊 {{ suggestion().difficulty }}
        </p>
      }

      <!-- Expandable Action Section -->
      @if (suggestion().action) {
        <div class="mt-4">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            (click)="toggleAction()">
            <span>🎯 Ver pasos detallados</span>
            @if (actionExpanded()) {
              <svg lucideChevronUp class="h-4 w-4"></svg>
            } @else {
              <svg lucideChevronDown class="h-4 w-4"></svg>
            }
          </button>
          @if (actionExpanded()) {
            <div class="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line animate-[fadeIn_0.2s_ease-out]">
              {{ suggestion().action }}
            </div>
          }
        </div>
      }

      <!-- Badges + CTA -->
      <div class="mt-5 flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="complexityStyles[suggestion().complexity]">
            {{ complexityLabels[suggestion().complexity] }}
          </span>
          <span class="rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]" [class]="potentialStyles[suggestion().marketPotential]">
            {{ potentialLabels[suggestion().marketPotential] }}
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

  protected readonly actionExpanded = signal(false);

  protected readonly complexityLabels = COMPLEXITY_LABELS;
  protected readonly complexityStyles = COMPLEXITY_STYLES;
  protected readonly potentialLabels = MARKET_POTENTIAL_LABELS;
  protected readonly potentialStyles = POTENTIAL_STYLES;

  protected toggleAction(): void {
    this.actionExpanded.update(v => !v);
  }
}

