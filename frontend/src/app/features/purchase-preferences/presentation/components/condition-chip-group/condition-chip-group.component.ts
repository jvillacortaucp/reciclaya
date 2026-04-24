import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialCondition, SelectOption } from '../../../domain/purchase-preferences.models';

@Component({
  selector: 'app-condition-chip-group',
  standalone: true,
  template: `
    <div class="flex flex-wrap gap-2">
      @for (condition of options; track condition.value) {
        <button
          type="button"
          class="rounded-xl border px-3 py-2 text-sm font-medium transition"
          [class.border-emerald-400]="value === condition.value"
          [class.bg-emerald-50]="value === condition.value"
          [class.text-emerald-700]="value === condition.value"
          [class.border-slate-200]="value !== condition.value"
          [class.bg-slate-100]="value !== condition.value"
          [class.text-slate-600]="value !== condition.value"
          (click)="select(condition.value)"
        >
          {{ condition.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionChipGroupComponent {
  @Input({ required: true }) options: readonly SelectOption<MaterialCondition>[] = [];
  @Input({ required: true }) value: MaterialCondition = 'fresh';
  @Output() readonly valueChange = new EventEmitter<MaterialCondition>();

  protected select(value: MaterialCondition): void {
    this.valueChange.emit(value);
  }
}

