import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-input',
  standalone: true,
  template: `
    <label class="flex w-full flex-col gap-1 text-sm text-slate-700">
      <span>{{ label }}</span>
      <input class="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value" />
      @if (hint) { <small class="text-slate-500">{{ hint }}</small> }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() hint = '';
}
