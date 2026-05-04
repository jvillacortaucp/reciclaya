import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideBot } from '@lucide/angular';
import { ASSISTANT_CHAT_COPY } from '../../data/assistant-chat.constants';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [LucideBot],
  template: `
    <div class="flex w-full gap-3 animate-fade-in-up">
      <span class="mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200/50">
        <svg lucideBot class="h-4.5 w-4.5"></svg>
      </span>

      <div class="max-w-3xl rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
        <div class="flex items-center gap-2.5 text-sm font-medium leading-relaxed text-slate-600 md:text-base">
          <span>{{ copy.loadingMessage }}</span>
          <span class="inline-flex gap-1.5">
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></span>
            <span class="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></span>
          </span>
        </div>
      </div>
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
export class TypingIndicatorComponent {
  protected readonly copy = ASSISTANT_CHAT_COPY;
}

