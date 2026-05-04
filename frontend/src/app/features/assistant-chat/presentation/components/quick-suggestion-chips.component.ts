import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChatQuickSuggestion } from '../../data/assistant-chat.constants';

@Component({
  selector: 'app-quick-suggestion-chips',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-2.5">
      @for (item of suggestions(); track item.id) {
        <button
          type="button"
          class="rounded-full border border-slate-200/80 bg-slate-50/60 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-emerald-50"
          (click)="selected.emit(item.label)">
          {{ item.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickSuggestionChipsComponent {
  suggestions = input.required<readonly ChatQuickSuggestion[]>();
  selected = output<string>();
}

