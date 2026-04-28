import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ChatQuickSuggestion } from '../../data/assistant-chat.constants';

@Component({
  selector: 'app-quick-suggestion-chips',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-3">
      @for (item of suggestions(); track item.id) {
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
