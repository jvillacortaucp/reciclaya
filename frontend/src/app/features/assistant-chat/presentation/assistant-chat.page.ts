import { ChangeDetectionStrategy, Component, computed, inject, ViewChild, ElementRef, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ASSISTANT_CHAT_COPY,
  ASSISTANT_QUICK_SUGGESTIONS
} from '../data/assistant-chat.constants';
import { AssistantChatFacade } from '../application/assistant-chat.facade';
import { AssistantChatHttpService } from '../infrastructure/assistant-chat.http.service';
import { ProductSuggestion } from '../models/assistant-chat.model';
import { ProtectedActionService } from '../../../core/services/protected-action.service';
import { ChatInputComponent } from './components/chat-input.component';
import { ChatMessageBubbleComponent } from './components/chat-message-bubble.component';
import { ProductSuggestionCardsComponent } from './components/product-suggestion-cards.component';
import { QuickSuggestionChipsComponent } from './components/quick-suggestion-chips.component';
import { TypingIndicatorComponent } from './components/typing-indicator.component';

@Component({
  selector: 'app-assistant-chat-page',
  standalone: true,
  providers: [AssistantChatHttpService, AssistantChatFacade, DatePipe],
  imports: [
    ReactiveFormsModule,
    ChatMessageBubbleComponent,
    TypingIndicatorComponent,
    ProductSuggestionCardsComponent,
    QuickSuggestionChipsComponent,
    ChatInputComponent
  ],
  templateUrl: './assistant-chat.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssistantChatPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly facade = inject(AssistantChatFacade);
  private readonly protectedActionService = inject(ProtectedActionService);

  @ViewChild('chatContainer') private readonly chatContainer?: ElementRef<HTMLDivElement>;

  protected readonly copy = ASSISTANT_CHAT_COPY;
  protected readonly quickSuggestions = ASSISTANT_QUICK_SUGGESTIONS;
  protected readonly messages = this.facade.messages;
  protected readonly typing = this.facade.typing;
  protected readonly selectedSuggestionId = this.facade.selectedSuggestionId;
  protected readonly hasSelection = this.facade.hasSelection;
  protected readonly selectedSuggestion = computed(() => {
    const selectedId = this.selectedSuggestionId();
    if (!selectedId) return null;

    for (const message of this.messages()) {
      const suggestion = message.suggestions?.find((item) => item.id === selectedId);
      if (suggestion) return suggestion;
    }
    return null;
  });

  protected readonly form = this.fb.nonNullable.group({
    input: ['', [Validators.required, Validators.maxLength(120)]]
  });

  constructor() {
    this.facade.initializeConversation();

    effect(() => {
      // Create a dependency on messages so this runs when messages change
      const msgs = this.messages();
      if (msgs.length) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.chatContainer?.nativeElement) {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  protected sendMessage(): void {
    const rawValue = this.form.controls.input.getRawValue();
    const residue = rawValue.trim();

    if (this.form.invalid || !residue) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.submitResidueMessage(residue);
    this.form.reset({ input: '' });
  }

  protected applySuggestion(value: string): void {
    this.form.controls.input.setValue(value);
    this.sendMessage();
  }

  protected onProductSelected(suggestion: ProductSuggestion): void {
    // Select suggestion in the facade and navigate to recommendations 'process' tab.
    this.facade.selectSuggestion(suggestion);

    const targetUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/app/recommendations', suggestion.id], {
        queryParams: { tab: 'process', recommendedProduct: suggestion.productName }
      })
    );

    this.protectedActionService.requireAuthForAction({
      actionName: this.getProtectedActionLabel('process'),
      returnUrl: targetUrl,
      onAllowed: () => {
        void this.router.navigateByUrl(targetUrl);
      }
    });
  }

  protected goToRecommendations(tab: 'process' | 'explanation' | 'market'): void {
    const selected = this.selectedSuggestion();
    if (!selected) return;

    const targetUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/app/recommendations', selected.id], {
        queryParams: { tab }
      })
    );

    this.protectedActionService.requireAuthForAction({
      actionName: this.getProtectedActionLabel(tab),
      returnUrl: targetUrl,
      onAllowed: () => {
        void this.router.navigateByUrl(targetUrl);
      }
    });
  }

  private getProtectedActionLabel(tab: 'process' | 'explanation' | 'market'): string {
    const actionMap: Record<'process' | 'explanation' | 'market', string> = {
      process: this.copy.routeProcess,
      explanation: this.copy.routeExplanation,
      market: this.copy.routeMarket
    };
    return actionMap[tab];
  }
}
