import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucidePaperclip, LucideSendHorizontal } from '@lucide/angular';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [ReactiveFormsModule, LucidePaperclip, LucideSendHorizontal],
  template: `
    <form class="flex items-center gap-3" (submit)="$event.preventDefault(); !disabled() && submitted.emit()">
      <div class="relative flex-1">
        <input
          [formControl]="control()"
          type="text"
          class="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-5 pr-14 text-base text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:h-16 sm:rounded-3xl sm:text-lg"
          [placeholder]="placeholder()"
          [readOnly]="disabled()"
          [class.opacity-60]="disabled()" />
        <span class="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg lucidePaperclip class="h-5 w-5"></svg>
        </span>
      </div>
      <button
        type="submit"
        [disabled]="disabled()"
        class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:h-14 sm:w-14 sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
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
