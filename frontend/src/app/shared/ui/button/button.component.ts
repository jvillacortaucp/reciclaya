import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button [type]="type" [class]="buttonClass" [disabled]="disabled">
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';

  get buttonClass(): string {
    const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition';
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
    } as const;

    return `${base} ${variants[this.variant]}`;
  }
}
