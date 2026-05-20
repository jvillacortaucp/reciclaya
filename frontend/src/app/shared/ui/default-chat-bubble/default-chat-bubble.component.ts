import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { LucideSendHorizontal } from '@lucide/angular';
import { FormsModule } from '@angular/forms';

export interface DefaultChatBubbleMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

@Component({
  selector: 'app-default-chat-bubble',
  standalone: true,
  imports: [FormsModule, LucideSendHorizontal],
  template: `
    <div class="pointer-events-none fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      @if (isOpen()) {
        <div
          class="pointer-events-auto w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300"
          [class.translate-y-1]="!isOpen()"
          [class.opacity-0]="!isOpen()"
          [class.opacity-100]="isOpen()">
          <div class="rounded-t-2xl bg-emerald-700 p-4 text-white">
            <h3 class="text-2xl font-semibold leading-tight text-white">{{ title }}</h3>
            @if (message) {
              <p class="mt-1 text-base leading-relaxed text-emerald-100">{{ message }}</p>
            }
          </div>

          <div class="space-y-3 border-x rounded-b-2xl border-slate-200 bg-white px-3 pt-3 pb-3">
            @if (messages.length > 0 || typing) {
              <div class="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                @for (chatMessage of messages; track chatMessage.id) {
                  <div class="flex" [class.justify-end]="chatMessage.role === 'user'">
                    <p
                      class="max-w-[90%] rounded-xl px-3 py-2 text-sm leading-snug"
                      [class.bg-white]="chatMessage.role === 'assistant'"
                      [class.text-slate-700]="chatMessage.role === 'assistant'"
                      [class.border]="chatMessage.role === 'assistant'"
                      [class.border-slate-200]="chatMessage.role === 'assistant'"
                      [class.bg-emerald-600]="chatMessage.role === 'user'"
                      [class.text-white]="chatMessage.role === 'user'">
                      {{ chatMessage.content }}
                    </p>
                  </div>
                }
                @if (typing) {
                  <p class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                    Eco está escribiendo...
                  </p>
                }
              </div>
            }

            <form (ngSubmit)="submitMessage()" class="relative">
              <input
                [(ngModel)]="draftMessage"
                name="ecoMessage"
                [placeholder]="placeholder"
                [disabled]="disabledInput"
                class="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200" />
              <button
                type="submit"
                [disabled]="disabledInput"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-emerald-600"
                [attr.aria-label]="'Enviar mensaje a Eco'">
                <svg lucideSendHorizontal class="h-5 w-5"></svg>
              </button>
            </form>
              <button
                type="button"
                class="inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                (click)="triggerGoToMainChat()">
                {{ goToMainChatLabel }}
              </button>
            
          </div>
        </div>
      }

      <button
        type="button"
        class="pointer-events-auto ml-auto block cursor-pointer scale-100 transition-transform duration-300 ease-in-out hover:scale-105"
        [attr.aria-label]="ariaLabel"
        [attr.aria-expanded]="isOpen()"
        (click)="toggleOpen()">
        <img
          [src]="imageUrl"
          [alt]="imageAlt"
          class="mx-auto w-24 sm:w-28" />
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultChatBubbleComponent {
  @Input() title = 'Chatea con nosotros';
  @Input() message = '';
  @Input() imageUrl =
    'https://fuucmxcvhpclgtbanmmi.supabase.co/storage/v1/object/public/public-media/eco-removebg-preview%20(1).png';
  @Input() imageAlt = 'Eco';
  @Input() ariaLabel = 'Abrir chat Eco';
  @Input() placeholder = 'Escribe un mensaje';
  @Input() messages: readonly DefaultChatBubbleMessage[] = [];
  @Input() typing = false;
  @Input() disabledInput = false;
  @Input() showGoToMainChatCta = false;
  @Input() goToMainChatLabel = 'Ir al chat principal';
  @Input() opened?: boolean;

  @Output() readonly bubbleClick = new EventEmitter<void>();
  @Output() readonly quickActionClick = new EventEmitter<void>();
  @Output() readonly messageSubmit = new EventEmitter<string>();
  @Output() readonly goToMainChatClick = new EventEmitter<void>();

  protected readonly isOpen = signal(false);
  protected draftMessage = '';

  ngOnChanges(): void {
    if (typeof this.opened === 'boolean') {
      this.isOpen.set(this.opened);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }

  protected toggleOpen(): void {
    this.isOpen.update((open) => !open);
    this.bubbleClick.emit();
  }

  protected triggerQuickAction(): void {
    this.quickActionClick.emit();
  }

  protected triggerGoToMainChat(): void {
    this.goToMainChatClick.emit();
  }

  protected submitMessage(): void {
    const message = this.draftMessage.trim();
    if (!message) {
      return;
    }

    this.messageSubmit.emit(message);
    this.draftMessage = '';
  }
}
