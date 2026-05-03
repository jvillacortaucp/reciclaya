import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBot } from '@lucide/angular';
import { ASSISTANT_CHAT_COPY } from '../../data/assistant-chat.constants';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [LucideBot],
  template: `
    <div class="flex w-full gap-2">
      <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <svg lucideBot class="h-4 w-4"></svg>
      </span>

      <div class="max-w-3xl rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div class="flex items-center gap-2 text-sm leading-snug text-slate-600 md:text-base">
          <span>{{ copy.loadingMessage }}</span>
          <span class="inline-flex gap-1">
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.2s]"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.1s]"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypingIndicatorComponent {
  protected readonly copy = ASSISTANT_CHAT_COPY;
}
