import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideShieldCheck, LucideX } from '@lucide/angular';
import { MockPaymentCard } from '../../data/payment-card.mock';

export interface CardPaymentConfirmation {
  readonly holderName: string;
  readonly cardNumber: string;
  readonly expiryDate: string;
  readonly cvv: string;
  readonly useForSimulation: boolean;
}

@Component({
  selector: 'app-card-payment-modal',
  standalone: true,
  imports: [ReactiveFormsModule, LucideX, LucideShieldCheck],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[120] bg-slate-950/55 p-4 backdrop-blur-sm"
        (click)="onBackdropClick($event)"
      >
        <div class="mx-auto mt-12 w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl md:p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-xl font-semibold text-slate-900 md:text-2xl">Pago con tarjeta</h3>
              <p class="mt-1 text-sm text-slate-600">
                Ingresa o confirma los datos de tarjeta para simular el pago.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              aria-label="Cerrar modal"
              (click)="close()"
            >
              <svg lucideX class="h-4 w-4"></svg>
            </button>
          </div>

          <span
            class="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700"
          >
            MVP / Pago simulado
          </span>

          <form [formGroup]="form" class="mt-4 space-y-4" (ngSubmit)="confirm()">
            <div class="space-y-1.5">
              <label class="text-sm text-slate-700">Número de tarjeta</label>
              <input
                type="text"
                formControlName="cardNumber"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm text-slate-700">Titular</label>
              <input
                type="text"
                formControlName="holderName"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm text-slate-700">Vencimiento</label>
                <input
                  type="text"
                  formControlName="expiryDate"
                  placeholder="MM/AA"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm text-slate-700">CVV / CCV</label>
                <input
                  type="password"
                  formControlName="cvv"
                  maxlength="4"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                formControlName="useForSimulation"
                class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Usar esta tarjeta para la simulación
            </label>

            <p class="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Pago simulado para MVP. No se almacenan ni procesan datos bancarios reales.
            </p>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                (click)="close()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <svg lucideShieldCheck class="h-4 w-4"></svg>
                Confirmar tarjeta
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPaymentModalComponent {
  private readonly fb = new FormBuilder();

  @Input() open = false;
  @Input() mockCard: MockPaymentCard | null = null;

  @Output() readonly confirmed = new EventEmitter<CardPaymentConfirmation>();
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly form = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.minLength(19)]],
    holderName: ['', [Validators.required, Validators.minLength(3)]],
    expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    useForSimulation: [true]
  });

  ngOnChanges(): void {
    if (this.open && this.mockCard) {
      this.form.patchValue({
        cardNumber: this.mockCard.cardNumber,
        holderName: this.mockCard.holderName,
        expiryDate: this.mockCard.expiryDate,
        cvv: this.mockCard.cvv,
        useForSimulation: true
      });
    }
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    if (this.open) {
      this.close();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.closed.emit();
  }

  protected confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.confirmed.emit(this.form.getRawValue());
  }
}
