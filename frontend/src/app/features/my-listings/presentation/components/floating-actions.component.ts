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
  imports: [LucideDownload, LucidePlus, LucideSparkles, LucideStore, LucideX],
  template: `
    <div class="fixed bottom-6 right-6 z-40">
      @if (isOpen()) {
        <div class="mb-3 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ul class="space-y-1.5">
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
        class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
        [attr.aria-expanded]="isOpen()"
        aria-label="Abrir acciones rápidas"
        (click)="toggle()"
      >
        @if (isOpen()) {
          <svg lucideX size="22"></svg>
        } @else {
          <svg lucidePlus size="22"></svg>
        }
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingActionsComponent {
  @Input({ required: true }) actions: readonly FloatingActionOption[] = [];
  @Output() readonly actionSelected = new EventEmitter<FloatingActionOption['key']>();

  protected readonly isOpen = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected onActionSelect(action: FloatingActionOption['key']): void {
    this.actionSelected.emit(action);
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
