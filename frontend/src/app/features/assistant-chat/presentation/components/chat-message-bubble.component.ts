import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { LucideBot, LucideUserCircle2 } from '@lucide/angular';
import { ChatMessage } from '../../models/assistant-chat.model';

@Component({
  selector: 'app-chat-message-bubble',
  standalone: true,
  imports: [NgClass, DatePipe, LucideBot, LucideUserCircle2],
  template: `
    <div class="flex w-full gap-2" [class.justify-end]="message().role === 'user'">
      @if (message().role === 'assistant') {
        <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <svg lucideBot class="h-4 w-4"></svg>
        </span>
      }

      <div
        [class.ml-auto]="message().role === 'user'"
        [class.max-w-3xl]="message().role === 'assistant'"
        [class.max-w-md]="message().role === 'user'">
        <div
          class="rounded-2xl border px-4 py-3 shadow-sm"
          [ngClass]="
            message().role === 'assistant'
              ? 'border-slate-200 bg-white text-slate-900'
              : 'border-emerald-700 bg-emerald-700 text-white'
          ">
          <p class="text-sm leading-snug md:text-base">{{ message().content }}</p>
        </div>
        <p
          class="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400"
          [class.text-right]="message().role === 'user'">
          {{ message().role === 'assistant' ? 'RevaloraIA' : 'Usted' }} ·
          {{ message().createdAt | date: 'hh:mm a' }}
        </p>
      </div>

      @if (message().role === 'user') {
        <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
          <svg lucideUserCircle2 class="h-4 w-4"></svg>
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageBubbleComponent {
  message = input.required<ChatMessage>();
}
