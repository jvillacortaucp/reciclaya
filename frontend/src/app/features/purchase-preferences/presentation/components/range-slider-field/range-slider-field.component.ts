import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-range-slider-field',
  standalone: true,
  template: `
    <div class="grid gap-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-slate-700">{{ label }}</span>
        <strong class="text-sm font-semibold text-emerald-600">{{ value }} km</strong>
      </div>
      <input
        type="range"
        [min]="min"
        [max]="max"
        [value]="value"
        [style.background]="sliderBackground()"
        class="h-2 w-full cursor-pointer appearance-none rounded-lg [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm"
        (input)="onInput($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeSliderFieldComponent {
  @Input() label = 'Radio de interés';
  @Input() min = 5;
  @Input() max = 150;
  @Input() value = 50;
  @Output() readonly valueChange = new EventEmitter<number>();

  protected sliderBackground(): string {
    const pct = ((this.value - this.min) * 100) / (this.max - this.min);
    return `linear-gradient(to right, #10b981 ${pct}%, #e2e8f0 ${pct}%)`;
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(Number(target.value));
  }
}
