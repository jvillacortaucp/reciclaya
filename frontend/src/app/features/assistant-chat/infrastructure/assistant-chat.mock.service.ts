import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ASSISTANT_CHAT_SUGGESTIONS_MOCK } from '../data/assistant-chat.mock';
import { ProductSuggestion } from '../models/assistant-chat.model';

@Injectable()
export class AssistantChatMockService {
  getSuggestionsByResidue(residueInput: string): Observable<readonly ProductSuggestion[]> {
    const normalizedResidue = residueInput.trim().toLowerCase();
    const filtered = ASSISTANT_CHAT_SUGGESTIONS_MOCK.filter((item) =>
      item.residueInput.toLowerCase().includes(normalizedResidue)
    );

    const fallback = ASSISTANT_CHAT_SUGGESTIONS_MOCK.filter(
      (item) => item.residueInput.toLowerCase() === 'cáscara de mango'
    );

    const payload = (filtered.length ? filtered : fallback).slice(0, 3);
    const mockDelay = 600 + Math.floor(Math.random() * 401);
    return of(payload).pipe(delay(mockDelay));
  }
}

