import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../core/tokens/app.tokens';
import { SessionStorageService } from '../../core/services/session-storage.service';
import { CreateCommercialRequestPayload, CommercialRequestItem } from './domain/requests.models';

const REQUESTS_STORAGE_KEY = 'reciclaya.requests.mock';

@Injectable({ providedIn: 'root' })
export class RequestsMockRepository {
  private readonly latency = inject(APP_LATENCY_MS);
  private readonly sessionStorage = inject(SessionStorageService);

  list(): Observable<readonly CommercialRequestItem[]> {
    return of(this.getScopedRequests()).pipe(delay(this.latency));
  }

  getById(id: string): Observable<CommercialRequestItem | null> {
    return of(this.getScopedRequests().find((item) => item.id === id) ?? null).pipe(delay(this.latency));
  }

  create(payload: CreateCommercialRequestPayload): Observable<CommercialRequestItem> {
    const session = this.sessionStorage.session();
    const buyer = session?.user;
    const next: CommercialRequestItem = {
      id: `req-${Date.now()}`,
      listingId: payload.listingId,
      listingTitle: 'Solicitud desde marketplace',
      buyerId: buyer?.id ?? 'buyer-mock',
      buyerName: buyer?.fullName ?? 'Buyer Demo',
      sellerId: 'seller-mock',
      sellerName: 'Seller Demo',
      message: payload.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const current = this.readAll();
    this.writeAll([next, ...current]);

    return of(next).pipe(delay(this.latency));
  }

  accept(id: string): Observable<CommercialRequestItem | null> {
    return this.updateStatus(id, 'accepted');
  }

  reject(id: string): Observable<CommercialRequestItem | null> {
    return this.updateStatus(id, 'rejected');
  }

  cancel(id: string): Observable<CommercialRequestItem | null> {
    return this.updateStatus(id, 'cancelled');
  }

  private updateStatus(
    id: string,
    status: CommercialRequestItem['status']
  ): Observable<CommercialRequestItem | null> {
    const updated = this.readAll().map((item) => (item.id === id ? { ...item, status } : item));
    this.writeAll(updated);

    return of(updated.find((item) => item.id === id) ?? null).pipe(delay(this.latency));
  }

  private getScopedRequests(): CommercialRequestItem[] {
    const session = this.sessionStorage.session();
    const role = session?.user.role;
    const userId = session?.user.id;
    const items = this.readAll();

    if (role === 'admin') {
      return items;
    }

    if (role === 'seller') {
      const scoped = items.filter((item) => item.sellerId === userId);
      return scoped.length ? scoped : items;
    }

    const scoped = items.filter((item) => item.buyerId === userId);
    return scoped.length ? scoped : items;
  }

  private readAll(): CommercialRequestItem[] {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) {
      const seeded = this.seedRequests();
      this.writeAll(seeded);
      return seeded;
    }

    try {
      return JSON.parse(raw) as CommercialRequestItem[];
    } catch {
      const seeded = this.seedRequests();
      this.writeAll(seeded);
      return seeded;
    }
  }

  private writeAll(items: readonly CommercialRequestItem[]): void {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(items));
  }

  private seedRequests(): CommercialRequestItem[] {
    return [
      {
        id: 'req-seed-001',
        listingId: 'listing-seed-001',
        listingTitle: 'Cascara de mango',
        buyerId: 'buyer-seed',
        buyerName: 'EcoCompras SAC',
        sellerId: 'seller-seed',
        sellerName: 'Agroloop SAC',
        message: 'Estoy interesado en este lote',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  }
}
