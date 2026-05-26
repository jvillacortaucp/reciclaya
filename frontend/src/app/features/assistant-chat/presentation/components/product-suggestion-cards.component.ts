import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductSuggestion } from '../../models/assistant-chat.model';
import { ProductSuggestionCardComponent } from './product-suggestion-card.component';

@Component({
  selector: 'app-product-suggestion-cards',
  standalone: true,
  imports: [ProductSuggestionCardComponent],
  template: `
    <div class="flex w-full gap-4 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-x-visible sm:pb-0">
      @for (item of suggestions(); track item.id) {
        <div class="w-[85vw] max-w-[310px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink">
          <app-product-suggestion-card
            [suggestion]="item"
            (picked)="selected.emit($event)"
            (openLegal)="legalRequested.emit($event)" />
        </div>
      }
    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSuggestionCardsComponent {
  suggestions = input.required<readonly ProductSuggestion[]>();
  selected = output<ProductSuggestion>();
  legalRequested = output<ProductSuggestion>();
}
