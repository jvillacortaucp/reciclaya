import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  template: `
    <label class="flex w-full flex-col gap-1 text-sm text-slate-700">
      <span>{{ label }}</span>
      <textarea [rows]="rows"
        class="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-primary-500"
        [placeholder]="placeholder"></textarea>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
}
