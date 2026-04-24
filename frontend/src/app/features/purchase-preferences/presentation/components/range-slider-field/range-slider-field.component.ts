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
        class="slider-track h-2 w-full cursor-pointer appearance-none rounded-lg"
        (input)="onInput($event)"
      />
    </div>
  `,
  styles: `
    .slider-track::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      border: 2px solid #10b981;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
    }

    .slider-track::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      border: 2px solid #10b981;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
    }
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
