import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
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
  LucideShield
} from '@lucide/angular';
import {
  COMPLEXITY_LABELS,
  COMPLEXITY_STYLES,
  MARKET_POTENTIAL_LABELS,
  POTENTIAL_STYLES,
  NIVEL_LABELS,
  NIVEL_BADGE_STYLES,
  NIVEL_BORDER_STYLES,
  NIVEL_ICONS
} from '../../data/assistant-chat.constants';
import { ProductSuggestion } from '../../models/assistant-chat.model';

@Component({
  selector: 'app-product-suggestion-card',
  standalone: true,
  imports: [
    LucideWheat, LucideFlaskConical, LucideRecycle, LucideSprout, LucideFlame,
    LucideBanknote, LucideFactory, LucideGift, LucideLeaf, LucideWrench,
    LucideChevronDown, LucideShield
  ],
  template: `
    <div
      class="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-200"
      [class.hover:border-emerald-200]="suggestion().colorNivel === 'verde'"
      [class.hover:border-amber-200]="suggestion().colorNivel === 'amarillo'"
      [class.hover:border-orange-200]="suggestion().colorNivel === 'naranja'"
      [class.hover:border-red-200]="suggestion().colorNivel === 'rojo'">

      <!-- Left color stripe indicator -->
      <div class="absolute left-0 top-0 bottom-0 w-1" [class]="cardStripeClass()"></div>

      <div class="pl-1.5">
        <!-- Header: icon + regulation badge + monetizable badge -->
        <div class="mb-3 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all" [class]="iconBgClass()">
              @switch (suggestion().iconName) {
                @case ('flask-conical') { <svg lucideFlaskConical class="h-4.5 w-4.5"></svg> }
                @case ('recycle') { <svg lucideRecycle class="h-4.5 w-4.5"></svg> }
                @case ('sprout') { <svg lucideSprout class="h-4.5 w-4.5"></svg> }
                @case ('flame') { <svg lucideFlame class="h-4.5 w-4.5"></svg> }
                @case ('cash') { <svg lucideBanknote class="h-4.5 w-4.5"></svg> }
                @case ('leaf') { <svg lucideLeaf class="h-4.5 w-4.5"></svg> }
                @case ('tools') { <svg lucideWrench class="h-4.5 w-4.5"></svg> }
                @case ('gift') { <svg lucideGift class="h-4.5 w-4.5"></svg> }
                @case ('factory') { <svg lucideFactory class="h-4.5 w-4.5"></svg> }
                @default { <svg lucideWheat class="h-4.5 w-4.5"></svg> }
              }
            </span>

            <!-- Regulation Level Badge -->
            @if (suggestion().colorNivel) {
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold transition hover:opacity-80 cursor-pointer"
                [class]="nivelBadgeStyles[suggestion().colorNivel!]"
                (click)="openLegal.emit(suggestion())"
                [title]="'Ver requisitos legales — ' + nivelLabels[suggestion().colorNivel!]">
                <span class="h-1.5 w-1.5 rounded-full shrink-0" [class]="nivelDotClass()"></span>
                <span>{{ nivelLabels[suggestion().colorNivel!] }}</span>
              </button>
            }
          </div>

          @if (suggestion().monetizable) {
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Monetizable
            </span>
          } @else {
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              No monetizable
            </span>
          }
        </div>

        <!-- Title + Sector -->
        <div class="mb-2">
          <span class="text-[10px] font-bold tracking-wider text-emerald-600 uppercase">{{ suggestion().sectorName }}</span>
          <h4 class="mt-0.5 line-clamp-1 text-base font-bold leading-snug text-slate-800" title="{{ suggestion().productName }}">{{ suggestion().productName }}</h4>
          <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{{ suggestion().description }}</p>
        </div>

        <!-- Compact Financial/Time/Qty Info Grid -->
        @if (suggestion().estimatedValue && suggestion().estimatedValue !== 'No definido') {
          <div class="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-50/50 border border-slate-100/60 p-2 text-center text-xs">
            <div class="flex flex-col items-center justify-center p-1 min-w-0">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Valor</span>
              <span class="mt-0.5 font-bold text-emerald-700 truncate w-full" title="{{ suggestion().estimatedValue }}">{{ suggestion().estimatedValue }}</span>
            </div>
            
            <div class="flex flex-col items-center justify-center border-l border-slate-200/40 p-1 min-w-0">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Tiempo</span>
              <span class="mt-0.5 font-semibold text-slate-600 truncate w-full" title="{{ suggestion().timeToMoney && suggestion().timeToMoney !== 'n/a' ? suggestion().timeToMoney : 'Inmediato' }}">
                {{ suggestion().timeToMoney && suggestion().timeToMoney !== 'n/a' ? suggestion().timeToMoney : 'Inmediato' }}
              </span>
            </div>

            <div class="flex flex-col items-center justify-center border-l border-slate-200/40 p-1 min-w-0">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Mín. Cant</span>
              <span class="mt-0.5 font-semibold text-slate-600 truncate w-full" title="{{ suggestion().minQuantity && suggestion().minQuantity !== 'n/a' ? suggestion().minQuantity : 'Variable' }}">
                {{ suggestion().minQuantity && suggestion().minQuantity !== 'n/a' ? suggestion().minQuantity : 'Variable' }}
              </span>
            </div>
          </div>
        }

        <!-- Difficulty line -->
        @if (suggestion().difficulty) {
          <div class="mt-2.5 text-[11px] text-slate-500 truncate" title="{{ suggestion().difficulty }}">
            <span class="font-semibold text-slate-600">Dificultad: </span>{{ suggestion().difficulty }}
          </div>
        }

        <!-- Expandable Steps Accordion -->
        @if (suggestion().action) {
          <div class="mt-2.5">
            <button
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
              (click)="toggleAction()">
              <svg lucideChevronDown class="h-3.5 w-3.5 transition-transform duration-200" [class.rotate-180]="actionExpanded()"></svg>
              <span>Pasos detallados</span>
            </button>
            @if (actionExpanded()) {
              <div class="mt-1.5 rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-[11px] leading-relaxed text-slate-600 whitespace-pre-line max-h-[110px] overflow-y-auto scrollbar-thin">
                {{ suggestion().action }}
              </div>
            }
          </div>
        }

        <!-- Legal Info Button (only for level >= 2) -->
        @if (suggestion().colorNivel && suggestion().nivelRegulatorio && suggestion().nivelRegulatorio! >= 2) {
          <button
            type="button"
            class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-xs"
            [class]="nivelBadgeStyles[suggestion().colorNivel!]"
            (click)="openLegal.emit(suggestion())">
            <svg lucideShield class="h-3.5 w-3.5"></svg>
            <span>Requisitos regulatorios</span>
          </button>
        }

        <!-- Footer: Badges + CTA button -->
        <div class="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div class="flex flex-wrap gap-1">
            <span class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" [class]="complexityStyles[suggestion().complexity]">
              {{ complexityLabels[suggestion().complexity].replace('Comp. ', '') }}
            </span>
            <span class="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" [class]="potentialStyles[suggestion().marketPotential]">
              {{ potentialLabels[suggestion().marketPotential].replace('Pot. ', '') }}
            </span>
          </div>
          <button
            type="button"
            class="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs hover:shadow-sm cursor-pointer"
            (click)="picked.emit(suggestion())">
            Ver proceso
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSuggestionCardComponent {
  suggestion = input.required<ProductSuggestion>();
  selected = input<boolean>(false);
  picked = output<ProductSuggestion>();
  openLegal = output<ProductSuggestion>();

  protected readonly actionExpanded = signal(false);

  protected readonly complexityLabels = COMPLEXITY_LABELS;
  protected readonly complexityStyles = COMPLEXITY_STYLES;
  protected readonly potentialLabels = MARKET_POTENTIAL_LABELS;
  protected readonly potentialStyles = POTENTIAL_STYLES;
  protected readonly nivelLabels = NIVEL_LABELS;
  protected readonly nivelBadgeStyles = NIVEL_BADGE_STYLES;
  protected readonly nivelBorderStyles = NIVEL_BORDER_STYLES;
  protected readonly nivelIcons = NIVEL_ICONS;

  /** Computes the left border indicator color class */
  protected readonly cardStripeClass = computed(() => {
    const color = this.suggestion().colorNivel;
    switch (color) {
      case 'verde': return 'bg-emerald-500';
      case 'amarillo': return 'bg-amber-400';
      case 'naranja': return 'bg-orange-500';
      case 'rojo': return 'bg-red-500';
      default: return 'bg-slate-200';
    }
  });

  /** Computes the dynamic dot class for regulation level */
  protected readonly nivelDotClass = computed(() => {
    const color = this.suggestion().colorNivel;
    switch (color) {
      case 'verde': return 'bg-emerald-500';
      case 'amarillo': return 'bg-amber-500';
      case 'naranja': return 'bg-orange-500';
      case 'rojo': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  });

  /** Computes the icon avatar background color class */
  protected readonly iconBgClass = computed(() => {
    const color = this.suggestion().colorNivel;
    switch (color) {
      case 'verde': return 'bg-emerald-50 text-emerald-600';
      case 'amarillo': return 'bg-amber-50 text-amber-600';
      case 'naranja': return 'bg-orange-50 text-orange-600';
      case 'rojo': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  });

  protected toggleAction(): void {
    this.actionExpanded.update(v => !v);
  }
}

