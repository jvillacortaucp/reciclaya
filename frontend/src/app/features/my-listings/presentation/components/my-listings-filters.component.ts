import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideSearch, LucideX } from '@lucide/angular';
import { MyListingsSelectOption } from '../../data/my-listings.constants';
import { MyListingsFilterState } from '../../domain/my-listing.model';

@Component({
  selector: 'app-my-listings-filters',
  standalone: true,
  imports: [ReactiveFormsModule, LucideSearch, LucideX],
  template: `
    <section class="w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6" [formGroup]="form">
      <div
        class="origin-top overflow-hidden transition-all duration-300 ease-in-out"
        [class.max-h-[32rem]]="open"
        [class.opacity-100]="open"
        [class.translate-y-0]="open"
        [class.max-h-0]="!open"
        [class.opacity-0]="!open"
        [class.-translate-y-1]="!open"
      >
        <div class="grid gap-4 lg:grid-cols-4">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Tipo de Residuo</span>
            <select
              formControlName="residueType"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              @for (option of residueTypeOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Sector</span>
            <select
              formControlName="sector"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              @for (option of sectorOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Estado</span>
            <select
              formControlName="status"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              @for (option of statusOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Tipo de Intercambio</span>
            <select
              formControlName="exchangeType"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              @for (option of exchangeOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Producto</span>
            <select
              formControlName="productType"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              @for (option of productOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1.5 lg:col-span-2">
            <span class="text-sm font-medium text-slate-600">Residuo específico</span>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-400">
                <svg lucideSearch size="16"></svg>
              </span>
              <input
                formControlName="specificResidue"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Producto específico..."
              />
            </div>
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium text-slate-600">Fecha de publicación</span>
            <input
              type="date"
              formControlName="publishedDate"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </label>
        </div>

        <div class="mt-4 border-t border-slate-200 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            (click)="clearFilters.emit()"
          >
            <svg lucideX size="14"></svg>
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyListingsFiltersComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() open = false;
  @Input({ required: true }) residueTypeOptions: readonly MyListingsSelectOption<
    MyListingsFilterState['residueType']
  >[] = [];
  @Input({ required: true }) sectorOptions: readonly MyListingsSelectOption<MyListingsFilterState['sector']>[] = [];
  @Input({ required: true }) productOptions: readonly MyListingsSelectOption<MyListingsFilterState['productType']>[] =
    [];
  @Input({ required: true }) statusOptions: readonly MyListingsSelectOption<MyListingsFilterState['status']>[] = [];
  @Input({ required: true }) exchangeOptions: readonly MyListingsSelectOption<
    MyListingsFilterState['exchangeType']
  >[] = [];

  @Output() readonly clearFilters = new EventEmitter<void>();
}
