import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LucideShieldCheck, LucideX } from '@lucide/angular';
import { SimulatedPaymentCard } from '../../models/pre-order.model';

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
                inputmode="numeric"
                maxlength="19"
                placeholder="1234-5678-9012-3456"
                (input)="onCardNumberInput()"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm text-slate-700">Titular</label>
              <input
                type="text"
                formControlName="holderName"
                maxlength="80"
                (input)="onHolderNameInput()"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm text-slate-700">Vencimiento</label>
                <div class="grid grid-cols-2 gap-2">
                  <select
                    formControlName="expiryMonth"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200">
                    <option value="">Mes</option>
                    @for (month of expiryMonths; track month.value) {
                      <option [value]="month.value">{{ month.label }}</option>
                    }
                  </select>
                  <select
                    formControlName="expiryYear"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200">
                    <option value="">Año</option>
                    @for (year of expiryYears; track year) {
                      <option [value]="year">{{ year }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm text-slate-700">CVV / CCV</label>
                <input
                  type="password"
                  formControlName="cvv"
                  inputmode="numeric"
                  maxlength="3"
                  placeholder="123"
                  (input)="onCvvInput()"
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
                [disabled]="form.invalid"
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
  protected readonly expiryMonths = Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1).padStart(2, '0');
    return { value, label: value };
  });
  protected readonly expiryYears = this.buildExpiryYears();

  @Input() open = false;
  @Input() mockCard: SimulatedPaymentCard | null = null;

  @Output() readonly confirmed = new EventEmitter<CardPaymentConfirmation>();
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly form = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}-\d{4}-\d{4}$/)]],
    holderName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/)]],
    expiryMonth: ['', [Validators.required]],
    expiryYear: ['', [Validators.required]],
    expiryDate: [''],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    useForSimulation: [true]
  }, { validators: [this.expiryFutureValidator.bind(this)] });

  ngOnChanges(): void {
    if (this.open && this.mockCard) {
      this.form.patchValue({
        cardNumber: this.formatCardNumber(this.mockCard.cardNumber),
        holderName: this.normalizeHolder(this.mockCard.holderName),
        ...this.parseMockExpiry(this.mockCard.expiryDate),
        cvv: this.normalizeDigits(this.mockCard.cvv, 3),
        useForSimulation: true
      });
      this.form.updateValueAndValidity();
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

    const raw = this.form.getRawValue();
    const normalizedExpiry = this.normalizeExpiryForEmit(raw.expiryMonth, raw.expiryYear);
    this.form.controls.expiryDate.setValue(normalizedExpiry);

    this.confirmed.emit({
      holderName: this.normalizeHolder(raw.holderName),
      cardNumber: raw.cardNumber,
      expiryDate: normalizedExpiry,
      cvv: raw.cvv,
      useForSimulation: raw.useForSimulation
    });
  }

  protected onCardNumberInput(): void {
    const formatted = this.formatCardNumber(this.form.controls.cardNumber.value);
    this.form.controls.cardNumber.setValue(formatted, { emitEvent: false });
  }

  protected onHolderNameInput(): void {
    const holder = this.normalizeHolder(this.form.controls.holderName.value);
    this.form.controls.holderName.setValue(holder, { emitEvent: false });
  }

  protected onCvvInput(): void {
    const cvv = this.normalizeDigits(this.form.controls.cvv.value, 3);
    this.form.controls.cvv.setValue(cvv, { emitEvent: false });
  }

  private buildExpiryYears(): string[] {
    const nowYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, index) => String(nowYear + index));
  }

  private expiryFutureValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as typeof this.form;
    const month = group.controls.expiryMonth.value;
    const year = group.controls.expiryYear.value;
    if (!month || !year) {
      return null;
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);
    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return { expiryInvalid: true };
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const selectedMonthStart = new Date(yearNumber, monthNumber - 1, 1);
    if (selectedMonthStart <= currentMonthStart) {
      return { expiryPast: true };
    }

    return null;
  }

  private parseMockExpiry(expiry: string): { expiryMonth: string; expiryYear: string } {
    if (!expiry) {
      return { expiryMonth: '', expiryYear: '' };
    }

    const mmyy = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (mmyy) {
      const month = mmyy[1];
      const yy = Number(mmyy[2]);
      const baseCentury = yy >= 70 ? 1900 : 2000;
      return { expiryMonth: month, expiryYear: String(baseCentury + yy) };
    }

    const yymm = expiry.match(/^(\d{4})-(\d{2})$/);
    if (yymm) {
      return { expiryMonth: yymm[2], expiryYear: yymm[1] };
    }

    return { expiryMonth: '', expiryYear: '' };
  }

  private normalizeExpiryForEmit(month: string, year: string): string {
    if (!month || !year) {
      return '';
    }
    const yy = year.slice(-2);
    return `${month}/${yy}`;
  }

  private formatCardNumber(value: string): string {
    const digits = this.normalizeDigits(value, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1-');
  }

  private normalizeDigits(value: string, maxLength: number): string {
    return (value ?? '').replace(/\D/g, '').slice(0, maxLength);
  }

  private normalizeHolder(value: string): string {
    return (value ?? '')
      .replace(/[^A-Za-zÀ-ÿ\s]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trimStart();
  }
}
