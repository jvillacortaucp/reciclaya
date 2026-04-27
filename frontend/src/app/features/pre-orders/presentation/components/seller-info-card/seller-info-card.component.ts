import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideBadgeCheck, LucideBuilding2, LucideMapPin } from '@lucide/angular';
import { SellerInfo } from '../../../models/pre-order.model';

@Component({
  selector: 'app-seller-info-card',
  standalone: true,
  imports: [LucideBuilding2, LucideBadgeCheck, LucideMapPin],
  template: `
    @if (seller) {
      <article class="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <svg lucideBuilding2 class="h-6 w-6"></svg>
            </span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">{{ seller.name }}</h3>
                @if (seller.verified) {
                  <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <svg lucideBadgeCheck class="h-3.5 w-3.5"></svg>
                    Verificado
                  </span>
                }
              </div>
              <p class="text-sm leading-relaxed text-slate-600">
                {{ seller.contactName }} · {{ seller.phone }} · {{ seller.email }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            (click)="requestInfo.emit()"
          >
            Solicitar información
          </button>
        </div>

        <div class="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
          <svg lucideMapPin class="h-4 w-4 text-emerald-700"></svg>
          <span class="font-medium">{{ seller.address }}</span>
        </div>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerInfoCardComponent {
  @Input({ required: true }) seller: SellerInfo | null = null;
  @Output() readonly requestInfo = new EventEmitter<void>();
}
