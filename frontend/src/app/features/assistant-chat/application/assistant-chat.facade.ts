import { Injectable, computed, signal } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ASSISTANT_CHAT_COPY } from '../data/assistant-chat.constants';
import { AssistantChatHttpService } from '../infrastructure/assistant-chat.http.service';
import { SessionStorageService } from '../../../core/services/session-storage.service';
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
  private currentScope = 'guest';

  readonly messages = computed(() => this.state().messages);
  readonly typing = computed(() => this.state().typing);
  readonly selectedSuggestionId = computed(() => this.state().selectedSuggestionId);
  readonly hasSelection = computed(() => !!this.state().selectedSuggestionId);

  constructor(
    private readonly service: AssistantChatHttpService,
    private readonly sessionStorageService: SessionStorageService
  ) {
    this.currentScope = this.resolveScope();
    this.initSession();
    this.loadState();
  }

  initializeConversation(): void {
    this.ensureScopeSync();
    if (this.messages().length > 0) return;

    this.pushAssistantText(ASSISTANT_CHAT_COPY.greeting);
    this.pushAssistantText(ASSISTANT_CHAT_COPY.firstQuestion);
  }

  submitResidueMessage(input: string): void {
    this.ensureScopeSync();
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
    this.ensureScopeSync();
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
    const storedId = localStorage.getItem(this.getSessionKey());
    if (storedId) {
      this.sessionId = storedId;
    } else {
      this.sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sess-' + Math.random().toString(36).substring(2);
      localStorage.setItem(this.getSessionKey(), this.sessionId);
    }
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
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
      localStorage.setItem(this.getStorageKey(), JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat state', e);
    }
  }

  clearConversation(): void {
    this.ensureScopeSync();
    localStorage.removeItem(this.getStorageKey());
    localStorage.removeItem(this.getSessionKey());
    this.sessionId = '';
    this.messageCounter.set(0);
    this.state.set({
      messages: [],
      selectedSuggestionId: null,
      typing: false
    });
    this.initSession();
  }

  private ensureScopeSync(): void {
    const nextScope = this.resolveScope();
    if (nextScope === this.currentScope) {
      return;
    }

    this.currentScope = nextScope;
    this.messageCounter.set(0);
    this.state.set({
      messages: [],
      selectedSuggestionId: null,
      typing: false
    });
    this.initSession();
    this.loadState();
  }

  private resolveScope(): string {
    const session = this.sessionStorageService.session();
    return session?.user?.id?.trim() || 'guest';
  }

  private getStorageKey(): string {
    return `${STORAGE_KEY}_${this.currentScope}`;
  }

  private getSessionKey(): string {
    return `${SESSION_KEY}_${this.currentScope}`;
  }
}
