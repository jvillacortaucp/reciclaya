import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-stepper',
  standalone: true,
  template: `
    <ol class="flex items-center gap-3 text-sm">
      @for (stepLabel of steps; track stepLabel; let idx = $index) {
        <li class="flex items-center gap-2">
          <span class="grid h-6 w-6 place-items-center rounded-full"
            [class]="idx <= activeStep ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'">{{ idx + 1 }}</span>
          <span>{{ stepLabel }}</span>
        </li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  @Input() steps: readonly string[] = [];
  @Input() activeStep = 0;
}
