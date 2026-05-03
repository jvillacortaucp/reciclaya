import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucidePaperclip, LucideSendHorizontal } from '@lucide/angular';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [ReactiveFormsModule, LucidePaperclip, LucideSendHorizontal],
  template: `
    <form class="flex items-center gap-3" (submit)="$event.preventDefault(); !disabled() && submitted.emit()">
      <div class="relative flex-1 group">
        <input
          [formControl]="control()"
          type="text"
          class="h-14 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-5 pr-28 text-base text-slate-800 placeholder:text-slate-400/80 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-50 transition-all duration-300 sm:h-16 sm:rounded-3xl sm:text-base"
          [placeholder]="placeholder()"
          [readOnly]="disabled()"
          [class.opacity-60]="disabled()" />

        <!-- Floating action area for paperclip and char count -->
        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 select-none">
          <span class="text-[11px] font-bold tracking-wider text-slate-400/70 bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/40 backdrop-blur-sm">
            {{ control().value.length }}/120
          </span>
          <span class="text-slate-300">
            <svg lucidePaperclip class="h-4.5 w-4.5"></svg>
          </span>
        </div>
      </div>

      <button
        type="submit"
        [disabled]="disabled() || !control().value.trim()"
        class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition-all duration-300 hover:bg-emerald-700 hover:scale-105 active:scale-95 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:h-14 sm:w-14 sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none">
        <svg lucideSendHorizontal class="h-5 w-5"></svg>
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  control = input.required<FormControl<string>>();
  placeholder = input.required<string>();
  disabled = input<boolean>(false);
  submitted = output<void>();
}


