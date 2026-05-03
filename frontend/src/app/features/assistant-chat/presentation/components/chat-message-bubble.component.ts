import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { LucideBot, LucideUserCircle2 } from '@lucide/angular';
import { ChatMessage } from '../../models/assistant-chat.model';

@Component({
  selector: 'app-chat-message-bubble',
  standalone: true,
  imports: [NgClass, DatePipe, LucideBot, LucideUserCircle2],
  template: `
    <div class="flex w-full gap-3 animate-fade-in-up" [class.justify-end]="message().role === 'user'">
      @if (message().role === 'assistant') {
        <span class="mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200/50">
          <svg lucideBot class="h-4.5 w-4.5"></svg>
        </span>
      }

      <div
        class="group relative flex flex-col gap-1"
        [class.items-end]="message().role === 'user'"
        [class.max-w-3xl]="message().role === 'assistant'"
        [class.max-w-md]="message().role === 'user'">
        
        <div
          class="rounded-2xl border px-4.5 py-3 shadow-sm transition-all duration-300 hover:shadow-md relative"
          [ngClass]="
            message().role === 'assistant'
              ? 'border-slate-200/80 bg-white text-slate-800 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
              : 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-tr-sm rounded-tl-2xl rounded-br-2xl rounded-bl-2xl'
          ">
          <p class="text-sm leading-relaxed md:text-base whitespace-pre-wrap selection:bg-emerald-100 selection:text-emerald-900">{{ message().content }}</p>

          <!-- Copy button for bot/assistant messages -->
          @if (message().role === 'assistant') {
            <button
              type="button"
              (click)="copyToClipboard(message().content)"
              class="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 focus:opacity-100 focus:outline-none"
              [title]="copied() ? '¡Copiado!' : 'Copiar mensaje'">
              @if (copied()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600 animate-pulse">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              }
            </button>
          }
        </div>

        <p
          class="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <span>{{ message().role === 'assistant' ? 'ReciclaIA bot' : 'Tú' }}</span>
          <span class="text-slate-300">•</span>
          <span>{{ message().createdAt | date: 'hh:mm a' }}</span>
        </p>
      </div>

      @if (message().role === 'user') {
        <span class="mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-600 shadow-sm border border-slate-300/40">
          <svg lucideUserCircle2 class="h-4.5 w-4.5"></svg>
        </span>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out both;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageBubbleComponent {
  message = input.required<ChatMessage>();
  copied = signal<boolean>(false);

  protected copyToClipboard(text: string): void {
    void navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

