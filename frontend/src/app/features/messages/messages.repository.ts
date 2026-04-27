import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../core/tokens/app.tokens';
import { AuthFacade } from '../auth/services/auth.facade';
import {
  CreateMessagePayload,
  MarkThreadReadResult,
  MessageItem,
  MessageThreadDetail,
  MessageThreadListItem
} from './domain/messages.models';

const THREADS_STORAGE_KEY = 'reciclaya.messages.threads.mock';

@Injectable({ providedIn: 'root' })
export class MessagesMockRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly authFacade = inject(AuthFacade);

  listThreads(): Observable<readonly MessageThreadListItem[]> {
    return of(this.getScopedThreads()).pipe(delay(this.latency));
  }

  getThread(threadId: string): Observable<MessageThreadDetail | null> {
    return of(this.readThreads().find((thread) => thread.id === threadId) ?? null).pipe(delay(this.latency));
  }

  getOrCreateFromRequest(requestId: string): Observable<MessageThreadDetail> {
    const existing = this.readThreads().find((thread) => thread.commercialRequestId === requestId);
    if (existing) {
      return of(existing).pipe(delay(this.latency));
    }

    const next = this.buildSeedThread({
      threadId: `thread-${Date.now()}`,
      requestId
    });
    this.writeThreads([next, ...this.readThreads()]);

    return of(next).pipe(delay(this.latency));
  }

  sendMessage(threadId: string, payload: CreateMessagePayload): Observable<MessageItem> {
    const threads = this.readThreads();
    const thread = threads.find((item) => item.id === threadId);
    if (!thread) {
      throw new Error('Thread not found.');
    }

    const senderName = this.authFacade.user()?.fullName ?? 'Usuario';
    const senderId = this.authFacade.user()?.id ?? 'mock-user';
    const now = new Date().toISOString();
    const message: MessageItem = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      body: payload.body,
      createdAt: now,
      readAt: null,
      isMine: true
    };

    const nextThreads = threads.map((item) =>
      item.id === threadId
        ? {
            ...item,
            messages: [...item.messages, message]
          }
        : item
    );

    this.writeThreads(nextThreads);

    return of(message).pipe(delay(this.latency));
  }

  markAsRead(threadId: string): Observable<MarkThreadReadResult> {
    const now = new Date().toISOString();
    const currentUserId = this.authFacade.user()?.id;
    const threads = this.readThreads();
    let updatedCount = 0;

    const nextThreads = threads.map((thread) => {
      if (thread.id !== threadId) {
        return thread;
      }

      return {
        ...thread,
        messages: thread.messages.map((message) => {
          if (message.senderId === currentUserId || message.readAt) {
            return message;
          }

          updatedCount += 1;
          return {
            ...message,
            readAt: now
          };
        })
      };
    });

    this.writeThreads(nextThreads);

    return of({ threadId, updatedCount }).pipe(delay(this.latency));
  }

  private getScopedThreads(): MessageThreadListItem[] {
    const user = this.authFacade.user();
    const role = user?.role;
    const userName = user?.fullName;

    return this.readThreads()
      .filter((thread) => {
        if (role === 'admin') {
          return true;
        }

        if (role === 'seller') {
          return thread.sellerName === userName;
        }

        return thread.buyerName === userName;
      })
      .map((thread) => this.toListItem(thread))
      .sort((left, right) => (right.lastMessageAt ?? '').localeCompare(left.lastMessageAt ?? ''));
  }

  private toListItem(thread: MessageThreadDetail): MessageThreadListItem {
    const lastMessage = [...thread.messages].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
    const unreadCount = thread.messages.filter((message) => !message.isMine && !message.readAt).length;

    return {
      id: thread.id,
      commercialRequestId: thread.commercialRequestId,
      listingId: thread.listing.id,
      listingTitle: thread.listing.title,
      buyerName: thread.buyerName,
      sellerName: thread.sellerName,
      lastMessagePreview: lastMessage?.body ?? '',
      lastMessageAt: lastMessage?.createdAt ?? null,
      unreadCount,
      status: thread.status
    };
  }

  private readThreads(): MessageThreadDetail[] {
    const raw = localStorage.getItem(THREADS_STORAGE_KEY);
    if (!raw) {
      const seeded = [this.buildSeedThread()];
      this.writeThreads(seeded);
      return seeded;
    }

    try {
      return JSON.parse(raw) as MessageThreadDetail[];
    } catch {
      const seeded = [this.buildSeedThread()];
      this.writeThreads(seeded);
      return seeded;
    }
  }

  private writeThreads(threads: readonly MessageThreadDetail[]): void {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  }

  private buildSeedThread(overrides?: { threadId?: string; requestId?: string }): MessageThreadDetail {
    const buyerName = this.authFacade.user()?.role === 'seller' ? 'EcoCompras SAC' : this.authFacade.user()?.fullName ?? 'EcoCompras SAC';
    const sellerName = this.authFacade.user()?.role === 'seller' ? this.authFacade.user()?.fullName ?? 'Agroloop SAC' : 'Agroloop SAC';

    return {
      id: overrides?.threadId ?? 'thread-seed-001',
      commercialRequestId: overrides?.requestId ?? 'request-seed-001',
      listing: {
        id: 'listing-seed-001',
        title: 'Cascara de mango',
        quantity: 10,
        unit: 'tons'
      },
      buyerName,
      sellerName,
      status: 'active',
      messages: [
        {
          id: 'msg-seed-001',
          senderId: 'seed-buyer',
          senderName: buyerName,
          body: 'Hola, me interesa coordinar la entrega.',
          createdAt: new Date().toISOString(),
          readAt: null,
          isMine: this.authFacade.user()?.role !== 'seller'
        }
      ]
    };
  }
}
