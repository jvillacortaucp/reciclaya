import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-select',
  standalone: true,
  template: `
    <label class="flex w-full flex-col gap-1 text-sm text-slate-700">
      <span>{{ label }}</span>
      <select class="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500">
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent {
  @Input() label = '';
  @Input() options: ReadonlyArray<{ value: string; label: string }> = [];
}
