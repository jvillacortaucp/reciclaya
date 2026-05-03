import { Injectable, computed, signal } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ASSISTANT_CHAT_COPY } from '../data/assistant-chat.constants';
import { AssistantChatHttpService } from '../infrastructure/assistant-chat.http.service';
import {
  AssistantChatState,
  ChatMessage,
  ProductSuggestion
} from '../models/assistant-chat.model';

const STORAGE_KEY = 'reciclaya_assistant_chat_state';
const SESSION_KEY = 'reciclaya_assistant_session_id';

@Injectable()
export class AssistantChatFacade {
  private readonly messageCounter = signal(0);
  private readonly state = signal<AssistantChatState>({
    messages: [],
    selectedSuggestionId: null,
    typing: false
  });
  private sessionId = '';

  readonly messages = computed(() => this.state().messages);
  readonly typing = computed(() => this.state().typing);
  readonly selectedSuggestionId = computed(() => this.state().selectedSuggestionId);
  readonly hasSelection = computed(() => !!this.state().selectedSuggestionId);

  constructor(private readonly service: AssistantChatHttpService) {
    this.initSession();
    this.loadState();
  }

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
      .sendMessage(this.sessionId, residue)
      .pipe(
        finalize(() => this.setTyping(false)),
        catchError(() => {
          this.pushAssistantText('Lo siento, tuve un problema de conexión con el servidor. ¿Podemos intentarlo de nuevo?');
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) return;

        if (response.replyText) {
          this.pushAssistantText(response.replyText);
        }

        if (response.suggestions && response.suggestions.length > 0) {
          this.pushSuggestionMessage(response.suggestions);
        } else if (!response.replyText) {
          // Fallback if n8n returned nothing
          this.pushAssistantText('Recibí tu mensaje, pero no tengo sugerencias en este momento.');
        }
      });
  }

  selectSuggestion(suggestion: ProductSuggestion): void {
    this.state.update((prev) => {
      const newState = { ...prev, selectedSuggestionId: suggestion.id };
      this.saveState(newState.messages);
      return newState;
    });

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

    this.state.update((prev) => {
      const newState = { ...prev, messages: [...prev.messages, message] };
      this.saveState(newState.messages);
      return newState;
    });
  }

  private pushAssistantText(content: string): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    this.state.update((prev) => {
      const newState = { ...prev, messages: [...prev.messages, message] };
      this.saveState(newState.messages);
      return newState;
    });
  }

  private pushUserText(content: string): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    this.state.update((prev) => {
      const newState = { ...prev, messages: [...prev.messages, message] };
      this.saveState(newState.messages);
      return newState;
    });
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
    return `msg-${Date.now()}-${value}`;
  }

  private initSession(): void {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (storedId) {
      this.sessionId = storedId;
    } else {
      this.sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess-' + Math.random().toString(36).substring(2);
      localStorage.setItem(SESSION_KEY, this.sessionId);
    }
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored) as readonly ChatMessage[];
        if (Array.isArray(messages)) {
          this.state.update(prev => ({ ...prev, messages }));
          this.messageCounter.set(messages.length);
        }
      }
    } catch (e) {
      console.error('Failed to load chat state', e);
    }
  }

  private saveState(messages: readonly ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat state', e);
    }
  }
}
