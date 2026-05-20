import { Injectable, computed, signal } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ASSISTANT_CHAT_COPY } from '../data/assistant-chat.constants';
import { AssistantChatHttpService } from '../infrastructure/assistant-chat.http.service';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import {
  AssistantChatState,
  ChatMessage,
  ProductSuggestion,
  QuickLinks,
  UrgenciaLevel
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

  /** Whether TTS (text-to-speech) is enabled for bot responses. */
  readonly ttsEnabled = signal(true);
  /** Whether the bot is currently speaking aloud. */
  readonly isSpeaking = signal(false);

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

    // Stop any ongoing TTS when user sends a new message
    this.stopSpeaking();

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
          // Speak the response if TTS is enabled
          this.speak(response.replyText);
        }

        if (response.suggestions && response.suggestions.length > 0) {
          this.pushSuggestionMessage(response.suggestions, response.urgencia);
        } else if (!response.replyText) {
          // Fallback if n8n returned nothing
          this.pushAssistantText('Recibí tu mensaje, pero no tengo sugerencias en este momento.');
        }

        // Show tips as a separate message if provided
        if (response.tips) {
          this.pushAssistantText(response.tips);
          this.speak(response.tips);
        }

        // Show quick links if provided
        if (response.quickLinks && Object.values(response.quickLinks).some(v => v != null)) {
          this.pushQuickLinksMessage(response.quickLinks);
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

  private pushSuggestionMessage(suggestions: readonly ProductSuggestion[], urgencia?: UrgenciaLevel): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content: 'Sugerencias de productos',
      createdAt: new Date().toISOString(),
      type: 'product_suggestions',
      suggestions,
      urgencia: urgencia ?? 'media'
    };

    this.state.update((prev) => {
      const newState = { ...prev, messages: [...prev.messages, message] };
      this.saveState(newState.messages);
      return newState;
    });
  }

  private pushQuickLinksMessage(quickLinks: QuickLinks): void {
    const message: ChatMessage = {
      id: this.nextMessageId(),
      role: 'assistant',
      content: 'Enlaces útiles',
      createdAt: new Date().toISOString(),
      type: 'quick_links',
      quickLinks
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

  // ─── TTS (Text-to-Speech) ────────────────────────────────────────

  /** Toggle TTS on/off. */
  toggleTts(): void {
    const next = !this.ttsEnabled();
    this.ttsEnabled.set(next);
    if (!next) {
      this.stopSpeaking();
    }
  }

  /** Cancel any ongoing speech. */
  stopSpeaking(): void {
    if (globalThis.window !== undefined && globalThis.speechSynthesis) {
      globalThis.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }

  /** Speak the given text using browser TTS (only if enabled). */
  private speak(text: string): void {
    if (!this.ttsEnabled()) return;
    if (globalThis.window === undefined || !globalThis.speechSynthesis) {
      console.warn('[TTS] speechSynthesis not available');
      return;
    }

    console.log('[TTS] Speaking:', text.substring(0, 60) + '...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-PE'; // Peruvian Spanish
    utterance.rate = 1.05;
    utterance.pitch = 1;

    // Assign a Spanish voice if available
    const assignVoice = () => {
      const voices = globalThis.speechSynthesis.getVoices();
      console.log('[TTS] Available voices:', voices.length);
      const spanishVoice = voices.find(v => v.lang.startsWith('es-')) ??
        voices.find(v => v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        console.log('[TTS] Using voice:', spanishVoice.name, spanishVoice.lang);
      }
    };

    // Voices may not be loaded yet — handle async loading
    const voices = globalThis.speechSynthesis.getVoices();
    if (voices.length > 0) {
      assignVoice();
      this.doSpeak(utterance);
    } else {
      // Voices load asynchronously in some browsers
      globalThis.speechSynthesis.onvoiceschanged = () => {
        assignVoice();
        this.doSpeak(utterance);
      };
      // Fallback: speak without voice selection after a short delay
      setTimeout(() => {
        if (!this.isSpeaking()) {
          console.log('[TTS] Fallback: attempting to speak with default system voice');
          this.doSpeak(utterance);
        }
      }, 500);
    }
  }

  private doSpeak(utterance: SpeechSynthesisUtterance): void {
    utterance.onstart = () => {
      console.log('[TTS] ▶ Started speaking');
      this.isSpeaking.set(true);
    };
    utterance.onend = () => {
      console.log('[TTS] ⏹ Finished speaking');
      this.isSpeaking.set(false);
    };
    utterance.onerror = (e) => {
      // synthesis-failed is common on Linux dev environments without speech-dispatcher.
      // End users on iOS/Android/Windows/Mac will not see this error.
      if (e.error === 'synthesis-failed') {
        console.warn('[TTS] Voice synthesis skipped (expected on Linux dev environments without voice packages). End users on Mobile/Windows/Mac will hear the voice normally.');
      } else {
        console.warn('[TTS] ❌ Error:', e.error);
      }
      this.isSpeaking.set(false);
    };

    try {
      globalThis.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[TTS] Catch error on speak:', e);
      this.isSpeaking.set(false);
    }
  }
}

