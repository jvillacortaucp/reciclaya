import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { APP_ROUTES } from '../../core/constants/app.constants';
import { AuthFacade } from '../auth/services/auth.facade';
import { UserRole } from '../../core/models/app.models';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { MessagesHttpRepository } from '../messages/messages-http.repository';
import { CommercialRequestItem } from './domain/requests.models';
import { RequestsHttpRepository } from './requests-http.repository';

@Component({
  selector: 'app-requests-page',
  imports: [SectionHeaderComponent, CardComponent, BadgeComponent, DatePipe],
  template: `
    <ui-section-header title="Solicitudes" subtitle="Administra solicitudes recibidas y emitidas" />

    @if (toastMessage()) {
      <div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {{ toastMessage() }}
      </div>
    }

    @if (loading()) {
      <p class="text-sm text-slate-500">Cargando solicitudes...</p>
    } @else if (!requests().length) {
      <ui-card>
        <p class="text-sm text-slate-600">No hay solicitudes disponibles para esta cuenta.</p>
      </ui-card>
    } @else {
      <section class="grid gap-3">
        @for (item of requests(); track item.id) {
          <ui-card>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base font-semibold text-slate-900">{{ item.listingTitle }}</h3>
                  <ui-badge [text]="statusLabel(item.status)" [status]="badgeStatus(item.status)" />
                </div>
                <p class="text-sm text-slate-600">
                  Buyer: {{ item.buyerName }} · Seller: {{ item.sellerName }}
                </p>
                @if (item.message) {
                  <p class="text-sm text-slate-700">{{ item.message }}</p>
                }
                <p class="text-xs text-slate-500">{{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>

              @if (item.status === 'pending' && !acting()) {
                <div class="flex flex-wrap items-center gap-2">
                  @if (canOpenConversation(item)) {
                    <button
                      type="button"
                      class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      (click)="openConversation(item.id)"
                    >
                      Abrir conversación
                    </button>
                  }
                  @if (canCancel(item)) {
                    <button
                      type="button"
                      class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      (click)="cancel(item.id)"
                    >
                      Cancelar
                    </button>
                  }
                  @if (canRespond(item)) {
                    <button
                      type="button"
                      class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                      (click)="accept(item.id)"
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                      (click)="reject(item.id)"
                    >
                      Rechazar
                    </button>
                  }
                </div>
              } @else if (canOpenConversation(item) && actingId() !== item.id) {
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    (click)="openConversation(item.id)"
                  >
                    Abrir conversación
                  </button>
                </div>
              } @else if (actingId() === item.id) {
                <p class="text-sm text-slate-500">Actualizando...</p>
              }
            </div>
          </ui-card>
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsPageComponent implements OnInit {
  private readonly repository = inject(RequestsHttpRepository);
  private readonly messagesRepository = inject(MessagesHttpRepository);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly acting = signal(false);
  protected readonly actingId = signal<string | null>(null);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly requests = signal<readonly CommercialRequestItem[]>([]);

  private readonly role = computed(() => this.authFacade.user()?.role ?? null);

  ngOnInit(): void {
    this.load();
  }

  protected accept(id: string): void {
    this.runAction(id, () => this.repository.accept(id), 'Solicitud aceptada.');
  }

  protected reject(id: string): void {
    this.runAction(id, () => this.repository.reject(id), 'Solicitud rechazada.');
  }

  protected cancel(id: string): void {
    this.runAction(id, () => this.repository.cancel(id), 'Solicitud cancelada.');
  }

  protected canRespond(item: CommercialRequestItem): boolean {
    return this.role() === UserRole.Seller;
  }

  protected canCancel(item: CommercialRequestItem): boolean {
    return this.role() === UserRole.Buyer;
  }

  protected canOpenConversation(item: CommercialRequestItem): boolean {
    return item.status === 'pending' || item.status === 'accepted';
  }

  protected badgeStatus(status: CommercialRequestItem['status']): 'success' | 'info' | 'warning' {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
      case 'cancelled':
        return 'warning';
      default:
        return 'info';
    }
  }

  protected statusLabel(status: CommercialRequestItem['status']): string {
    switch (status) {
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  }

  private load(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudieron cargar las solicitudes.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((items) => {
        this.requests.set(items);
      });
  }

  protected openConversation(requestId: string): void {
    this.acting.set(true);
    this.actingId.set(requestId);

    this.messagesRepository
      .getOrCreateFromRequest(requestId)
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo abrir la conversación.'));
          return EMPTY;
        }),
        finalize(() => {
          this.acting.set(false);
          this.actingId.set(null);
        })
      )
      .subscribe((thread) => {
        void this.router.navigateByUrl(`${APP_ROUTES.messages}?thread=${thread.id}`);
      });
  }

  private runAction(
    id: string,
    action: () => ReturnType<RequestsHttpRepository['accept']>,
    successMessage: string
  ): void {
    this.acting.set(true);
    this.actingId.set(id);

    action()
      .pipe(
        catchError((error: unknown) => {
          this.toastMessage.set(getErrorMessage(error, 'No se pudo actualizar la solicitud.'));
          return EMPTY;
        }),
        finalize(() => {
          this.acting.set(false);
          this.actingId.set(null);
        })
      )
      .subscribe(() => {
        this.toastMessage.set(successMessage);
        this.load();
      });
  }
}
