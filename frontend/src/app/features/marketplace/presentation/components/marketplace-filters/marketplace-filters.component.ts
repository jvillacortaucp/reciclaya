import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideSearch, LucideX } from '@lucide/angular';
import { SelectOption } from '../../../data/marketplace.constants';
import { ActiveFilterChip, MarketplaceFilterState, SortOption } from '../../../domain/marketplace.models';

@Component({
  selector: 'app-marketplace-filters',
  standalone: true,
  imports: [ReactiveFormsModule, LucideSearch, LucideX],
  template: `
    <section class="w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:p-6" [formGroup]="form">
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-400">
          <svg lucideSearch size="18"></svg>
        </span>
        <input
          formControlName="query"
          class="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="Buscar por producto, residuo, sector o ubicación"
        />
      </div>

      <div
        class="origin-top overflow-hidden transition-all duration-300 ease-in-out"
        [class.mt-4]="advancedOpen"
        [class.max-h-[34rem]]="advancedOpen"
        [class.opacity-100]="advancedOpen"
        [class.translate-y-0]="advancedOpen"
        [class.max-h-0]="!advancedOpen"
        [class.opacity-0]="!advancedOpen"
        [class.-translate-y-1]="!advancedOpen"
      >
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label class="grid gap-1">
            <span class="text-xs font-semibold uppercase tracking-[0.09em] text-slate-400">Tipo de residuo</span>
            <select formControlName="wasteType" class="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
              @for (option of wasteTypeOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1">
            <span class="text-xs font-semibold uppercase tracking-[0.09em] text-slate-400">Sector</span>
            <select formControlName="sector" class="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
              @for (option of sectorOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label class="grid gap-1">
            <span class="text-xs font-semibold uppercase tracking-[0.09em] text-slate-400">Tipo de intercambio</span>
            <select formControlName="exchangeType" class="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
              @for (option of exchangeOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          @for (chip of chips; track chip.key) {
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
              (click)="removeChip.emit(chip.key)"
            >
              {{ chip.label }}
              <svg lucideX size="14"></svg>
            </button>
          }
          @if (!chips.length) {
            <span class="text-sm text-slate-400">Sin filtros activos</span>
          }

          <div class="ml-auto inline-flex items-center gap-2">
            <span class="text-slate-500 text-sm">Ordenar por:</span>
            <select
              class="rounded-xl border border-transparent bg-transparent px-2 py-1 font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
              [value]="selectedSort"
              (change)="onSortChange($event)"
            >
              @for (option of sortOptions; track option.value) {
                <option class="text-xs placeholder:text-xs" [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            (click)="clearFilters.emit()"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceFiltersComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) wasteTypeOptions: readonly SelectOption<MarketplaceFilterState['wasteType']>[] = [];
  @Input({ required: true }) sectorOptions: readonly SelectOption<MarketplaceFilterState['sector']>[] = [];
  @Input({ required: true }) exchangeOptions: readonly SelectOption<MarketplaceFilterState['exchangeType']>[] = [];
  @Input({ required: true }) sortOptions: readonly SelectOption<SortOption>[] = [];
  @Input() selectedSort: SortOption = 'newest';
  @Input() chips: readonly ActiveFilterChip[] = [];
  @Input() advancedOpen = false;

  @Output() readonly removeChip = new EventEmitter<ActiveFilterChip['key']>();
  @Output() readonly moreFiltersClick = new EventEmitter<void>();
  @Output() readonly sortChange = new EventEmitter<SortOption>();
  @Output() readonly clearFilters = new EventEmitter<void>();

  protected onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortChange.emit(target.value as SortOption);
  }
}
