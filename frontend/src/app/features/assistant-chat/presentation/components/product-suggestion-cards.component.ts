import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductSuggestion } from '../../models/assistant-chat.model';
import { ProductSuggestionCardComponent } from './product-suggestion-card.component';

@Component({
  selector: 'app-product-suggestion-cards',
  standalone: true,
  imports: [ProductSuggestionCardComponent],
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      @for (item of suggestions(); track item.id) {
        <app-product-suggestion-card
          [suggestion]="item"
          [selected]="selectedSuggestionId() === item.id"
          (picked)="selected.emit($event)" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSuggestionCardsComponent {
  suggestions = input.required<readonly ProductSuggestion[]>();
  selectedSuggestionId = input<string | null>(null);
  selected = output<ProductSuggestion>();
}
