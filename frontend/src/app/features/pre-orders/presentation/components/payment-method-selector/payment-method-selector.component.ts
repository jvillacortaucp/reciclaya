import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideCreditCard,
  LucideFileText,
  LucideHandshake,
  LucideLandmark,
  LucideQrCode
} from '@lucide/angular';
import { PaymentMethod, PaymentMethodType } from '../../../models/pre-order.model';

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [LucideLandmark, LucideCreditCard, LucideQrCode, LucideHandshake, LucideFileText],
  template: `
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      @for (method of methods; track method.id) {
        <button
          type="button"
          [disabled]="!method.enabled"
          class="rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45"
          [class.border-emerald-600]="selectedType === method.id"
          [class.bg-emerald-50]="selectedType === method.id"
          [class.text-emerald-700]="selectedType === method.id"
          [class.border-slate-200]="selectedType !== method.id"
          [class.bg-white]="selectedType !== method.id"
          [class.text-slate-700]="selectedType !== method.id"
          (click)="method.enabled && select.emit(method.id)"
        >
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            @switch (method.id) {
              @case ('bank_transfer') { <svg lucideLandmark size="16"></svg> }
              @case ('card') { <svg lucideCreditCard size="16"></svg> }
              @case ('digital_wallet') { <svg lucideQrCode size="16"></svg> }
              @case ('cash_on_delivery') { <svg lucideHandshake size="16"></svg> }
              @default { <svg lucideFileText size="16"></svg> }
            }
          </span>
          <p class="mt-3 text-sm font-semibold">{{ method.label }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ method.description }}</p>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent {
  @Input() methods: readonly PaymentMethod[] = [];
  @Input() selectedType: PaymentMethodType = 'card';
  @Output() readonly select = new EventEmitter<PaymentMethodType>();
}
