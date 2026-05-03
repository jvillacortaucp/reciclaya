import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideLeaf, LucideSprayCan } from '@lucide/angular';
import { ResidueType } from '../../../../../core/enums/marketplace.enums';
import { SelectOption } from '../../../domain/purchase-preferences.models';

@Component({
  selector: 'app-residue-type-toggle',
  standalone: true,
  imports: [LucideLeaf, LucideSprayCan],
  template: `
    <div class="grid grid-cols-2 gap-2">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition"
          [class.border-emerald-500]="value === option.value"
          [class.bg-emerald-50]="value === option.value"
          [class.text-emerald-700]="value === option.value"
          [class.border-slate-200]="value !== option.value"
          [class.bg-white]="value !== option.value"
          [class.text-slate-600]="value !== option.value"
          (click)="select(option.value)"
        >
          @if (option.value === 'organic') {
            <svg lucideLeaf size="16"></svg>
          } @else {
            <svg lucideSprayCan size="16"></svg>
          }
          <span>{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResidueTypeToggleComponent {
  @Input({ required: true }) options: readonly SelectOption<ResidueType>[] = [];
  @Input({ required: true }) value: ResidueType = ResidueType.Organic;
  @Output() readonly valueChange = new EventEmitter<ResidueType>();

  protected select(value: ResidueType): void {
    this.valueChange.emit(value);
  }
}
