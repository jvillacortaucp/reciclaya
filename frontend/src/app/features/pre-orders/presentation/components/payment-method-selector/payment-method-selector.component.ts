import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideCreditCard, LucideLandmark, LucideWallet } from '@lucide/angular';
import { PaymentMethod } from '../../../../../core/models/app.models';
import { PAYMENT_METHOD_ICONS } from '../../../data/pre-order-screen.constants';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [LucideLandmark, LucideCreditCard, LucideWallet],
  template: `
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      @for (method of methods; track method.type) {
        <button
          type="button"
          class="rounded-2xl border px-4 py-5 text-left transition"
          [class.border-emerald-600]="selectedType === method.type"
          [class.bg-emerald-50]="selectedType === method.type"
          [class.text-emerald-700]="selectedType === method.type"
          [class.border-slate-200]="selectedType !== method.type"
          [class.bg-white]="selectedType !== method.type"
          [class.text-slate-700]="selectedType !== method.type"
          (click)="select.emit(method.type)"
        >
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            @switch (iconOf(method.type)) {
              @case ('landmark') { <svg lucideLandmark size="16"></svg> }
              @case ('credit-card') { <svg lucideCreditCard size="16"></svg> }
              @default { <svg lucideWallet size="16"></svg> }
            }
          </span>
          <p class="mt-3 text-base font-semibold">{{ method.label }}</p>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent {
  @Input() methods: readonly PaymentMethod[] = [];
  @Input() selectedType: PaymentMethod['type'] = 'transfer';
  @Output() readonly select = new EventEmitter<PaymentMethod['type']>();

  protected iconOf(type: PaymentMethod['type']): 'landmark' | 'credit-card' | 'wallet' {
    return PAYMENT_METHOD_ICONS[type];
  }
}

