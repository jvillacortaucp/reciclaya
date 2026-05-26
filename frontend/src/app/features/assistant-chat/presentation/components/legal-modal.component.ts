import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { LucideShield, LucideX, LucideFileText, LucideAlertTriangle } from '@lucide/angular';
import { ProductSuggestion } from '../../models/assistant-chat.model';
import {
  NIVEL_LABELS,
  NIVEL_BADGE_STYLES,
  NIVEL_ICONS
} from '../../data/assistant-chat.constants';

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [LucideShield, LucideX, LucideFileText, LucideAlertTriangle],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"></div>

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 animate-[slideUp_0.3s_ease-out] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl"
              [class]="headerIconBg()">
              <svg lucideShield class="h-5 w-5"></svg>
            </span>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Requisitos Legales</h2>
              <p class="text-xs text-slate-500">{{ suggestion().productName }}</p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            (click)="closed.emit()">
            <svg lucideX class="h-4 w-4"></svg>
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">

          <!-- Regulation Level Badge -->
          @if (suggestion().colorNivel) {
            <div
              class="flex items-center gap-3 rounded-2xl border p-4"
              [class]="nivelBadgeStyles[suggestion().colorNivel!]">
              <span class="text-2xl">{{ nivelIcons[suggestion().colorNivel!] }}</span>
              <div>
                <p class="text-sm font-bold">{{ nivelLabels[suggestion().colorNivel!] }}</p>
                @if (suggestion().riesgoLegal) {
                  <p class="text-xs mt-0.5 opacity-80">Riesgo legal: {{ suggestion().riesgoLegal }}</p>
                }
              </div>
            </div>
          }

          <!-- Primary Law Reference -->
          @if (suggestion().leyPrincipal) {
            <div class="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
              <svg lucideFileText class="h-5 w-5 text-slate-400 mt-0.5 shrink-0"></svg>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Normativa aplicable</p>
                <p class="text-sm font-medium text-slate-700 mt-1">{{ suggestion().leyPrincipal }}</p>
              </div>
            </div>
          }

          <!-- Supervisory Entities -->
          @if (suggestion().entidadesFiscalizadoras && suggestion().entidadesFiscalizadoras!.length > 0) {
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Entidades fiscalizadoras</p>
              <div class="flex flex-wrap gap-2">
                @for (entity of suggestion().entidadesFiscalizadoras!; track entity) {
                  <span class="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                    🏛️ {{ entity }}
                  </span>
                }
              </div>
            </div>
          }

          <!-- Seller Documents -->
          @if (suggestion().documentosVendedor && suggestion().documentosVendedor!.length > 0) {
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">📋 Documentos del vendedor</p>
              <ul class="space-y-2">
                @for (doc of suggestion().documentosVendedor!; track doc) {
                  <li class="flex items-start gap-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 px-4 py-2.5 text-sm text-slate-700">
                    <span class="text-emerald-500 mt-0.5">✓</span>
                    <span>{{ doc }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Buyer Documents -->
          @if (suggestion().documentosComprador && suggestion().documentosComprador!.length > 0) {
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">🏢 Documentos del comprador</p>
              <ul class="space-y-2">
                @for (doc of suggestion().documentosComprador!; track doc) {
                  <li class="flex items-start gap-2.5 rounded-xl bg-blue-50/50 border border-blue-100 px-4 py-2.5 text-sm text-slate-700">
                    <span class="text-blue-500 mt-0.5">✓</span>
                    <span>{{ doc }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Fine / Risk Warning -->
          @if (suggestion().multaMaximaReferencial) {
            <div class="flex items-start gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
              <svg lucideAlertTriangle class="h-5 w-5 text-orange-500 mt-0.5 shrink-0"></svg>
              <div>
                <p class="text-sm font-bold text-orange-800">⚠️ Advertencia importante</p>
                <p class="text-sm text-orange-700 mt-1 leading-relaxed">
                  El incumplimiento de la normativa puede conllevar sanciones y multas de <strong>{{ suggestion().multaMaximaReferencial }}</strong>.
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 border-t border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-b-3xl">
          <button
            type="button"
            class="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            (click)="closed.emit()">
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalModalComponent {
  suggestion = input.required<ProductSuggestion>();
  closed = output<void>();

  protected readonly nivelLabels = NIVEL_LABELS;
  protected readonly nivelBadgeStyles = NIVEL_BADGE_STYLES;
  protected readonly nivelIcons = NIVEL_ICONS;

  protected readonly headerIconBg = computed(() => {
    const color = this.suggestion().colorNivel;
    if (!color) return 'bg-slate-100 text-slate-500';
    const map: Record<string, string> = {
      verde: 'bg-emerald-100 text-emerald-600',
      amarillo: 'bg-amber-100 text-amber-600',
      naranja: 'bg-orange-100 text-orange-600',
      rojo: 'bg-red-100 text-red-600'
    };
    return map[color] ?? 'bg-slate-100 text-slate-500';
  });

  protected onBackdropClick(event: MouseEvent): void {
    // Close only when clicking directly on the backdrop
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
