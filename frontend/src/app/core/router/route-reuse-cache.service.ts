import { Injectable } from '@angular/core';
import { DetachedRouteHandle } from '@angular/router';

interface StoredRouteHandleEntry {
  readonly handle: DetachedRouteHandle;
  readonly storedAt: number;
  readonly ttlMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class RouteReuseCacheService {
  private readonly entries = new Map<string, StoredRouteHandleEntry>();

  store(key: string, handle: DetachedRouteHandle, ttlMs: number): void {
    this.entries.set(key, {
      handle,
      storedAt: Date.now(),
      ttlMs
    });
  }

  hasFresh(key: string): boolean {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.entries.delete(key);
      return false;
    }

    return true;
  }

  retrieve(key: string): DetachedRouteHandle | null {
    return this.hasFresh(key) ? this.entries.get(key)?.handle ?? null : null;
  }

  invalidate(...keys: string[]): void {
    keys.forEach((key) => this.entries.delete(key));
  }

  clear(): void {
    this.entries.clear();
  }
}
