import { Injectable } from '@angular/core';

export interface ViewCacheEntry<T> {
  readonly key: string;
  readonly payload: T;
  readonly loadedAt: number;
}

export interface ViewCachePolicy {
  readonly ttlMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class ViewCacheService {
  private readonly entries = new Map<string, ViewCacheEntry<unknown>>();

  getFresh<T>(key: string, policy: ViewCachePolicy): T | null {
    const entry = this.entries.get(key) as ViewCacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.loadedAt > policy.ttlMs) {
      this.entries.delete(key);
      return null;
    }

    return entry.payload;
  }

  set<T>(key: string, payload: T): void {
    this.entries.set(key, {
      key,
      payload,
      loadedAt: Date.now()
    });
  }

  invalidate(...keys: string[]): void {
    keys.forEach((key) => this.entries.delete(key));
  }

  clear(): void {
    this.entries.clear();
  }
}
