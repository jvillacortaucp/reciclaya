import { Injectable, computed, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { AssistantChatHttpService } from '../../assistant-chat/infrastructure/assistant-chat.http.service';

interface MarketplaceEcoChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt: string;
}

interface MarketplaceEcoChatState {
  readonly messages: readonly MarketplaceEcoChatMessage[];
  readonly typing: boolean;
  readonly exchangeCount: number;
  readonly showGoToMainChatCta: boolean;
  readonly lastUserMessage: string;
}

interface PersistedMarketplaceEcoChatState {
  readonly messages: readonly MarketplaceEcoChatMessage[];
  readonly exchangeCount: number;
  readonly showGoToMainChatCta: boolean;
  readonly lastUserMessage: string;
}

const CHAT_STORAGE_KEY = 'reciclaya_marketplace_eco_chat_state';
const CHAT_SESSION_KEY = 'reciclaya_marketplace_eco_chat_session';
const MAX_EXCHANGES = 3;

@Injectable()
export class MarketplaceEcoChatFacade {
  private readonly messageCounter = signal(0);
  private readonly state = signal<MarketplaceEcoChatState>({
    messages: [],
    typing: false,
    exchangeCount: 0,
    showGoToMainChatCta: false,
    lastUserMessage: ''
  });

  private sessionId = '';
  private currentScope = 'guest';

  readonly messages = computed(() => this.state().messages);
  readonly typing = computed(() => this.state().typing);
  readonly showGoToMainChatCta = computed(() => this.state().showGoToMainChatCta);
  readonly disabledInput = computed(() => this.typing() || this.showGoToMainChatCta());
  readonly lastUserMessage = computed(() => this.state().lastUserMessage);

  constructor(
    private readonly chatService: AssistantChatHttpService,
    private readonly sessionStorageService: SessionStorageService
  ) {
    this.currentScope = this.resolveScope();
    this.initSession();
    this.loadState();
  }

  submitMessage(rawInput: string): void {
    this.ensureScopeSync();

    const input = rawInput.trim();
    if (!input || this.disabledInput()) {
      return;
    }

    this.pushUserText(input);
    this.setTyping(true);

    this.chatService
      .sendMessage(this.sessionId, input)
      .pipe(
        finalize(() => this.setTyping(false)),
        catchError(() => {
          this.pushAssistantText(
            'Tuve un problema para responder aquí. Si quieres, te llevo al chat principal para ayudarte mejor.'
          );
          this.enableMainChatCta();
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        const reply = this.toShortReply(response.replyText, input);
        this.pushAssistantText(reply);

        const nextExchangeCount = this.state().exchangeCount + 1;
        const shouldPromoteToMainChat = nextExchangeCount >= MAX_EXCHANGES || this.isComplexIntent(input);
        if (shouldPromoteToMainChat) {
          this.pushAssistantText('Para darte una guía más completa, continuemos en el chat principal.');
          this.enableMainChatCta();
          return;
        }

        this.state.update((prev) => {
          const nextState = {
            ...prev,
            exchangeCount: nextExchangeCount
          };
          this.saveState(nextState);
          return nextState;
        });
      });
  }

  private pushAssistantText(content: string): void {
    const message: MarketplaceEcoChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content,
      createdAt: new Date().toISOString()
    };

    this.state.update((prev) => {
      const nextState = {
        ...prev,
        messages: [...prev.messages, message]
      };
      this.saveState(nextState);
      return nextState;
    });
  }

  private pushUserText(content: string): void {
    const message: MarketplaceEcoChatMessage = {
      id: this.nextMessageId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };

    this.state.update((prev) => {
      const nextState = {
        ...prev,
        messages: [...prev.messages, message],
        lastUserMessage: content
      };
      this.saveState(nextState);
      return nextState;
    });
  }

  private setTyping(value: boolean): void {
    this.state.update((prev) => {
      const nextState = {
        ...prev,
        typing: value
      };
      this.saveState(nextState);
      return nextState;
    });
  }

  private enableMainChatCta(): void {
    this.state.update((prev) => {
      const nextState = {
        ...prev,
        exchangeCount: MAX_EXCHANGES,
        showGoToMainChatCta: true
      };
      this.saveState(nextState);
      return nextState;
    });
  }

  private toShortReply(replyText: string | undefined, originalInput: string): string {
    const fallback = `Claro, puedo ayudarte con ${originalInput}. Te comparto una guía breve aquí y luego te acompaño al chat principal.`;
    const value = (replyText ?? '').trim() || fallback;
    if (value.length <= 260) {
      return value;
    }

    return `${value.slice(0, 257).trimEnd()}...`;
  }

  private isComplexIntent(input: string): boolean {
    const normalized = input.toLowerCase();
    return (
      normalized.includes('proceso') ||
      normalized.includes('analisis') ||
      normalized.includes('análisis') ||
      normalized.includes('mercado') ||
      normalized.includes('cost') ||
      normalized.includes('rentabilidad') ||
      normalized.includes('complejidad')
    );
  }

  private nextMessageId(): string {
    const value = this.messageCounter() + 1;
    this.messageCounter.set(value);
    return `mkt-eco-msg-${Date.now()}-${value}`;
  }

  private initSession(): void {
    const storedId = localStorage.getItem(this.getSessionKey());
    if (storedId) {
      this.sessionId = storedId;
      return;
    }

    this.sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(this.getSessionKey(), this.sessionId);
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as PersistedMarketplaceEcoChatState;
      if (!parsed || !Array.isArray(parsed.messages)) {
        return;
      }

      this.state.update((prev) => ({
        ...prev,
        messages: parsed.messages,
        exchangeCount: parsed.exchangeCount ?? 0,
        showGoToMainChatCta: parsed.showGoToMainChatCta ?? false,
        lastUserMessage: parsed.lastUserMessage ?? ''
      }));
      this.messageCounter.set(parsed.messages.length);
    } catch {
      // Ignore malformed local state to avoid breaking UI.
    }
  }

  private saveState(state: MarketplaceEcoChatState): void {
    const payload: PersistedMarketplaceEcoChatState = {
      messages: state.messages,
      exchangeCount: state.exchangeCount,
      showGoToMainChatCta: state.showGoToMainChatCta,
      lastUserMessage: state.lastUserMessage
    };

    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors; chat continues in memory.
    }
  }

  private ensureScopeSync(): void {
    const nextScope = this.resolveScope();
    if (nextScope === this.currentScope) {
      return;
    }

    this.currentScope = nextScope;
    this.state.set({
      messages: [],
      typing: false,
      exchangeCount: 0,
      showGoToMainChatCta: false,
      lastUserMessage: ''
    });
    this.messageCounter.set(0);
    this.initSession();
    this.loadState();
  }

  private resolveScope(): string {
    const session = this.sessionStorageService.session();
    return session?.user?.id?.trim() || 'guest';
  }

  private getStorageKey(): string {
    return `${CHAT_STORAGE_KEY}_${this.currentScope}`;
  }

  private getSessionKey(): string {
    return `${CHAT_SESSION_KEY}_${this.currentScope}`;
  }
}
