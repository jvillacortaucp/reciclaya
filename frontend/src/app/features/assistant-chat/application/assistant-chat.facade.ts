import { Injectable, computed, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ASSISTANT_CHAT_COPY } from '../data/assistant-chat.constants';
import { AssistantChatMockService } from '../infrastructure/assistant-chat.mock.service';
import {
  AssistantChatState,
  ChatMessage,
  ProductSuggestion
} from '../models/assistant-chat.model';

@Injectable()
export class AssistantChatFacade {
  private readonly messageCounter = signal(0);
  private readonly state = signal<AssistantChatState>({
    messages: [],
    selectedSuggestionId: null,
    typing: false
  });

  readonly messages = computed(() => this.state().messages);
  readonly typing = computed(() => this.state().typing);
  readonly selectedSuggestionId = computed(() => this.state().selectedSuggestionId);
  readonly hasSelection = computed(() => !!this.state().selectedSuggestionId);

  constructor(private readonly service: AssistantChatMockService) {}

  initializeConversation(): void {
    if (this.messages().length > 0) return;

    this.pushAssistantText(ASSISTANT_CHAT_COPY.greeting);
    this.pushAssistantText(ASSISTANT_CHAT_COPY.firstQuestion);
  }

  submitResidueMessage(input: string): void {
    const residue = input.trim();
    if (!residue) return;

    this.pushUserText(residue);
    this.setTyping(true);

    this.service
      .getSuggestionsByResidue(residue)
      .pipe(finalize(() => this.setTyping(false)))
      .subscribe((suggestions) => {
        this.pushAssistantText(
          `${ASSISTANT_CHAT_COPY.resultsPrefix} ${residue}. ${ASSISTANT_CHAT_COPY.resultsSuffix}`
        );
        this.pushSuggestionMessage(suggestions);
      });
  }

  selectSuggestion(suggestion: ProductSuggestion): void {
    this.state.update((prev) => ({
      ...prev,
      selectedSuggestionId: suggestion.id
    }));

    this.pushAssistantText(ASSISTANT_CHAT_COPY.selectionMessage);
  }

  private pushSuggestionMessage(suggestions: readonly ProductSuggestion[]): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content: 'Sugerencias de productos',
      createdAt: new Date().toISOString(),
      type: 'product_suggestions',
      suggestions
    };

    this.state.update((prev) => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }

  private pushAssistantText(content: string): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    this.state.update((prev) => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }

  private pushUserText(content: string): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    this.state.update((prev) => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }

  private setTyping(value: boolean): void {
    this.state.update((prev) => ({
      ...prev,
      typing: value
    }));
  }

  private nextMessageId(): string {
    const value = this.messageCounter() + 1;
    this.messageCounter.set(value);
    return `msg-${value}`;
  }
}

