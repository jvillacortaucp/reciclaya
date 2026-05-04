import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideBot, LucideExternalLink, LucideMapPin, LucideMessageCircle, LucideShoppingBag } from '@lucide/angular';
import { QuickLinks } from '../../models/assistant-chat.model';

@Component({
  selector: 'app-quick-links-card',
  standalone: true,
  imports: [LucideBot, LucideExternalLink, LucideMapPin, LucideMessageCircle, LucideShoppingBag],
  template: `
    <div class="flex w-full gap-2">
      <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <svg lucideBot class="h-4 w-4"></svg>
      </span>

      <div class="max-w-3xl w-full">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p class="mb-3 text-sm font-semibold text-slate-700">🔗 Enlaces útiles para tu búsqueda</p>

          <div class="flex flex-wrap gap-2">
            @if (quickLinks().googleMaps) {
              <a
                [href]="quickLinks().googleMaps"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100">
                <svg lucideMapPin class="h-3.5 w-3.5"></svg>
                Google Maps
                <svg lucideExternalLink class="h-3 w-3 opacity-60"></svg>
              </a>
            }
            @if (quickLinks().facebookMarketplace) {
              <a
                [href]="quickLinks().facebookMarketplace"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                <svg lucideShoppingBag class="h-3.5 w-3.5"></svg>
                FB Marketplace
                <svg lucideExternalLink class="h-3 w-3 opacity-60"></svg>
              </a>
            }
            @if (quickLinks().whatsappInfo) {
              <a
                [href]="'https://wa.me/' + sanitizePhone(quickLinks().whatsappInfo!)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition hover:bg-green-100">
                <svg lucideMessageCircle class="h-3.5 w-3.5"></svg>
                WhatsApp {{ quickLinks().whatsappInfo }}
                <svg lucideExternalLink class="h-3 w-3 opacity-60"></svg>
              </a>
            }
          </div>

          @if (quickLinks().localRecyclers && quickLinks().localRecyclers!.length > 0) {
            <div class="mt-3 border-t border-slate-100 pt-3">
              <p class="mb-1.5 text-xs font-medium text-slate-500">♻️ Recicladores locales:</p>
              <div class="flex flex-wrap gap-1.5">
                @for (name of quickLinks().localRecyclers!; track name) {
                  <span class="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {{ name }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
        <p class="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          EcoInnovador · Enlaces
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickLinksCardComponent {
  quickLinks = input.required<QuickLinks>();

  protected sanitizePhone(phone: string): string {
    return phone.replace(/[^0-9+]/g, '');
  }
}
