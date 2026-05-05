import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';
import { LucideBot } from '@lucide/angular';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [LucideBot],
  template: `
    <div class="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        class="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-700"
        aria-label="Iniciar guía interactiva"
        data-tour="bot-guide-button"
        (click)="onGuideRequested()"
      >
        @if (!botImageUrl || imageError()) {
          <span class="inline-flex h-full w-full items-center justify-center">
            <svg lucideBot size="22"></svg>
          </span>
        } @else {
          <img
            [src]="botImageUrl"
            alt="Bot guía"
            class="h-full w-full object-cover"
            (error)="imageError.set(true)"
          />
        }
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingActionsComponent {
  @Input() botImageUrl = '';
  @Output() readonly guideRequested = new EventEmitter<void>();

  protected readonly imageError = signal(false);

  protected onGuideRequested(): void {
    this.guideRequested.emit();
  }
}
