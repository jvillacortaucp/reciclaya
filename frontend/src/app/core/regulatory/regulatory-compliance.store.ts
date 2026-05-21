import { Injectable, signal } from '@angular/core';
import {
  BuyerComplianceFlags,
  RegulatoryComplianceRecord,
  SellerComplianceFlags
} from './regulatory.models';
import { DEFAULT_BUYER_COMPLIANCE, DEFAULT_SELLER_COMPLIANCE } from './regulatory.rules';

const STORAGE_KEY = 'regulatory-compliance.v1';

@Injectable({ providedIn: 'root' })
export class RegulatoryComplianceStore {
  private readonly records = signal<Record<string, RegulatoryComplianceRecord>>(this.readStorage());

  getRecord(userId: string | null | undefined): RegulatoryComplianceRecord {
    if (!userId) {
      return this.buildDefaultRecord();
    }

    return this.records()[userId] ?? this.buildDefaultRecord();
  }

  saveSeller(userId: string | null | undefined, patch: Partial<SellerComplianceFlags>): void {
    if (!userId) {
      return;
    }

    this.records.update((current) => {
      const next = {
        ...current,
        [userId]: {
          ...(current[userId] ?? this.buildDefaultRecord()),
          updatedAt: new Date().toISOString(),
          seller: {
            ...(current[userId]?.seller ?? DEFAULT_SELLER_COMPLIANCE),
            ...patch
          }
        }
      };
      this.persist(next);
      return next;
    });
  }

  saveBuyer(userId: string | null | undefined, patch: Partial<BuyerComplianceFlags>): void {
    if (!userId) {
      return;
    }

    this.records.update((current) => {
      const next = {
        ...current,
        [userId]: {
          ...(current[userId] ?? this.buildDefaultRecord()),
          updatedAt: new Date().toISOString(),
          buyer: {
            ...(current[userId]?.buyer ?? DEFAULT_BUYER_COMPLIANCE),
            ...patch
          }
        }
      };
      this.persist(next);
      return next;
    });
  }

  private buildDefaultRecord(): RegulatoryComplianceRecord {
    return {
      seller: { ...DEFAULT_SELLER_COMPLIANCE },
      buyer: { ...DEFAULT_BUYER_COMPLIANCE },
      updatedAt: null
    };
  }

  private readStorage(): Record<string, RegulatoryComplianceRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, RegulatoryComplianceRecord>) : {};
    } catch {
      return {};
    }
  }

  private persist(value: Record<string, RegulatoryComplianceRecord>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Keep UX resilient if localStorage is unavailable.
    }
  }
}
