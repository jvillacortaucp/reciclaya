import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, Subscription } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import {
  MessageItem,
  MessageThreadDetail,
  MessageThreadListItem
} from './domain/messages.models';
import { MessagesHttpRepository } from './messages-http.repository';

@Component({
  selector: 'app-messages-page',
  imports: [SectionHeaderComponent, CardComponent, DatePipe, ReactiveFormsModule],
  template: `
    <ui-section-header title="Mensajes" subtitle="Conversa con compradores y vendedores" />

    @if (toastMessage()) {
      <div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {{ toastMessage() }}
      </div>
    }

    @if (loading()) {
      <p class="text-sm text-slate-500">Cargando conversaciones...</p>
    } @else {
      <div class="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ui-card>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Threads</h3>
              <span class="text-xs text-slate-400">{{ threads().length }}</span>
            </div>

            @if (!threads().length) {
              <p class="text-sm text-slate-600">No hay conversaciones disponibles.</p>
            } @else {
              <div class="space-y-2">
                @for (thread of threads(); track thread.id) {
                  <button
                    type="button"
                    class="w-full rounded-xl border px-3 py-3 text-left transition"
                    [class.border-emerald-300]="selectedThreadId() === thread.id"
                    [class.bg-emerald-50]="selectedThreadId() === thread.id"
                    [class.border-slate-200]="selectedThreadId() !== thread.id"
                    [class.bg-white]="selectedThreadId() !== thread.id"
                    (click)="openThread(thread.id)"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-slate-900">{{ thread.listingTitle }}</p>
                        <p class="mt-1 truncate text-xs text-slate-500">{{ thread.lastMessagePreview || 'Sin mensajes aún' }}</p>
                      </div>
                      @if (thread.unreadCount > 0) {
                        <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {{ thread.unreadCount }}
                        </span>
                      }
                    </div>
                    <p class="mt-2 text-[11px] text-slate-400">
                      {{ thread.lastMessageAt ? (thread.lastMessageAt | date: 'dd/MM HH:mm') : 'Sin actividad' }}
                    </p>
                  </button>
                }
              </div>
            }
          </div>
        </ui-card>

        <ui-card>
          @if (detailLoading()) {
            <p class="text-sm text-slate-500">Cargando conversación...</p>
          } @else if (!activeThread()) {
            <div class="flex min-h-[420px] items-center justify-center">
              <p class="text-sm text-slate-500">Selecciona una conversación para ver los mensajes.</p>
            </div>
          } @else {
            <div class="flex h-full min-h-[420px] flex-col">
              <div class="border-b border-slate-200 pb-4">
                <h2 class="text-lg font-semibold text-slate-900">{{ activeThread()!.listing.title }}</h2>
                <p class="mt-1 text-sm text-slate-600">
                  {{ activeThread()!.buyerName }} · {{ activeThread()!.sellerName }}
                </p>
                <p class="mt-1 text-xs text-slate-400">
                  {{ activeThread()!.listing.quantity }} {{ activeThread()!.listing.unit }}
                </p>
              </div>

              <div class="flex-1 space-y-3 overflow-y-auto py-4">
                @for (message of activeThread()!.messages; track message.id) {
                  <div class="flex" [class.justify-end]="message.isMine">
                    <div
                      class="max-w-[80%] rounded-2xl px-4 py-3"
                      [class.bg-emerald-600]="message.isMine"
                      [class.text-white]="message.isMine"
                      [class.bg-slate-100]="!message.isMine"
                      [class.text-slate-900]="!message.isMine"
                    >
                      <p class="text-xs font-semibold opacity-80">{{ message.senderName }}</p>
                      <p class="mt-1 text-sm leading-relaxed">{{ message.body }}</p>
                      <p class="mt-2 text-[11px] opacity-70">{{ message.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </div>
                }
              </div>

              <form [formGroup]="form" (ngSubmit)="sendMessage()" class="border-t border-slate-200 pt-4">
                <div class="flex gap-3">
                  <textarea
                    formControlName="body"
                    rows="3"
                    class="min-h-[96px] flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="Escribe un mensaje"
                  ></textarea>
                  <button
                    type="submit"
                    [disabled]="form.invalid || sending()"
                    class="h-fit rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {{ sending() ? 'Enviando...' : 'Enviar' }}
                  </button>
                </div>
              </form>
            </div>
          }
        </ui-card>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  private readonly repository = inject(MessagesHttpRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  protected readonly loading = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly sending = signal(false);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly threads = signal<readonly MessageThreadListItem[]>([]);
  protected readonly activeThread = signal<MessageThreadDetail | null>(null);
  protected readonly selectedThreadId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const threadId = params.get('thread');
        this.loadThreads(threadId);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected openThread(threadId: string): void {
    this.selectedThreadId.set(threadId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { thread: threadId },
      queryParamsHandling: 'merge'
    });
    this.loadThread(threadId);
  }

  protected sendMessage(): void {
    const threadId = this.selectedThreadId();
    if (!threadId || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.repository
      .sendMessage(threadId, this.form.getRawValue())
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo enviar el mensaje.'));
          return EMPTY;
        }),
        finalize(() => this.sending.set(false))
      )
      .subscribe((message) => {
        this.form.reset({ body: '' });
        this.appendMessage(message);
        this.toastMessage.set('Mensaje enviado.');
        this.loadThreads(threadId, false);
      });
  }

  private loadThreads(preferredThreadId?: string | null, withLoading = true): void {
    if (withLoading) {
      this.loading.set(true);
    }

    this.repository
      .listThreads()
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudieron cargar las conversaciones.'));
          return EMPTY;
        }),
        finalize(() => {
          if (withLoading) {
            this.loading.set(false);
          }
        })
      )
      .subscribe((threads) => {
        this.threads.set(threads);
        const nextThreadId = preferredThreadId ?? this.selectedThreadId() ?? threads[0]?.id ?? null;

        if (!nextThreadId) {
          this.selectedThreadId.set(null);
          this.activeThread.set(null);
          return;
        }

        if (!threads.some((thread) => thread.id === nextThreadId)) {
          this.selectedThreadId.set(null);
          this.activeThread.set(null);
          return;
        }

        this.loadThread(nextThreadId, false);
      });
  }

  private loadThread(threadId: string, markRead = true): void {
    this.selectedThreadId.set(threadId);
    this.detailLoading.set(true);

    this.repository
      .getThread(threadId)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo cargar la conversación.'));
          return EMPTY;
        }),
        finalize(() => this.detailLoading.set(false))
      )
      .subscribe((thread) => {
        this.activeThread.set(thread);

        if (thread && markRead) {
          this.markAsRead(thread.id);
        }
      });
  }

  private markAsRead(threadId: string): void {
    this.repository
      .markAsRead(threadId)
      .pipe(catchError(() => EMPTY))
      .subscribe((result) => {
        if (result.updatedCount <= 0) {
          return;
        }

        const current = this.activeThread();
        if (current?.id === threadId) {
          const now = new Date().toISOString();
          this.activeThread.set({
            ...current,
            messages: current.messages.map((message) =>
              message.isMine || message.readAt
                ? message
                : {
                    ...message,
                    readAt: now
                  }
            )
          });
        }

        this.loadThreads(threadId, false);
      });
  }

  private appendMessage(message: MessageItem): void {
    const current = this.activeThread();
    if (!current) {
      return;
    }

    this.activeThread.set({
      ...current,
      messages: [...current.messages, message]
    });
  }
}
