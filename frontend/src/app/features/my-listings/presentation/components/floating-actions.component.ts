import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal
} from '@angular/core';
import {
  LucideBot,
  LucideDownload,
  LucidePlus,
  LucideSparkles,
  LucideStore,
  LucideX
} from '@lucide/angular';
import { FloatingActionOption } from '../../data/my-listings.constants';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [LucideBot, LucideDownload, LucidePlus, LucideSparkles, LucideStore, LucideX],
  template: `
    <div class="fixed bottom-6 right-6 z-40">
      @if (isOpen()) {
        <div class="mb-3 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ul class="space-y-1.5">
            <li>
              <button
                type="button"
                class="inline-flex w-full items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                (click)="onGuideRequested()"
              >
                <svg lucideBot size="16" class="text-emerald-600"></svg>
                Iniciar guía interactiva
              </button>
            </li>
            @for (item of actions; track item.key) {
              <li>
                <button
                  type="button"
                  class="inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  (click)="onActionSelect(item.key)"
                >
                  @switch (item.icon) {
                    @case ('plus') { <svg lucidePlus size="16" class="text-emerald-600"></svg> }
                    @case ('sparkles') { <svg lucideSparkles size="16" class="text-indigo-500"></svg> }
                    @case ('download') { <svg lucideDownload size="16" class="text-slate-500"></svg> }
                    @default { <svg lucideStore size="16" class="text-emerald-600"></svg> }
                  }
                  {{ item.label }}
                </button>
              </li>
            }
          </ul>
        </div>
      }

      <button
        type="button"
        class="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5"
        [attr.aria-expanded]="isOpen()"
        aria-label="Abrir asistente guía"
        data-tour="bot-guide-button"
        (click)="toggle()"
      >
        @if (imageError()) {
          <span class="inline-flex h-full w-full items-center justify-center bg-emerald-600 text-white">
            @if (isOpen()) {
              <svg lucideX size="22"></svg>
            } @else {
              <svg lucideBot size="22"></svg>
            }
          </span>
        } @else {
          <img
            [src]="botImageUrl"
            alt="Bot guía"
            class="h-full w-full object-cover"
            (error)="imageError.set(true)"
          />
          @if (isOpen()) {
            <span class="absolute inset-0 inline-flex items-center justify-center bg-slate-900/55 text-white">
              <svg lucideX size="22"></svg>
            </span>
          }
        }
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingActionsComponent {
  @Input({ required: true }) actions: readonly FloatingActionOption[] = [];
  @Input() botImageUrl = 'assets/images/bot-guide.jpg';
  @Output() readonly actionSelected = new EventEmitter<FloatingActionOption['key']>();
  @Output() readonly guideRequested = new EventEmitter<void>();

  protected readonly isOpen = signal(false);
  protected readonly imageError = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected onActionSelect(action: FloatingActionOption['key']): void {
    this.actionSelected.emit(action);
    this.isOpen.set(false);
  }

  protected onGuideRequested(): void {
    this.guideRequested.emit();
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
