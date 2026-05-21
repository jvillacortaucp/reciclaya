import { Injectable, signal } from '@angular/core';
import { COMPLIANCE_INITIAL_STATE } from './compliance-levels.constants';
import { resolveCurrentComplianceLevel } from './compliance-levels.helpers';
import { StoredComplianceLevelsState } from './compliance-levels.models';
import { RegulatoryLevel } from './regulatory.models';

const STORAGE_KEY = 'compliance-levels.v1';

@Injectable({
  providedIn: 'root'
})
export class ComplianceLevelsStore {
  private readonly stateMap = signal<Record<string, StoredComplianceLevelsState>>(this.readStorage());

  getUserState(userId: string | null | undefined): StoredComplianceLevelsState {
    const normalizedUserId = userId?.trim() || 'anonymous';
    const current = this.stateMap()[normalizedUserId];
    return this.cloneState(current ?? COMPLIANCE_INITIAL_STATE);
  }

  saveUserState(userId: string | null | undefined, state: StoredComplianceLevelsState): void {
    const normalizedUserId = userId?.trim() || 'anonymous';
    const nextMap = {
      ...this.stateMap(),
      [normalizedUserId]: this.cloneState(state)
    };

    this.stateMap.set(nextMap);
    this.persist(nextMap);
  }

  getCurrentLevel(userId: string | null | undefined): RegulatoryLevel {
    return resolveCurrentComplianceLevel(this.getUserState(userId));
  }

  private readStorage(): Record<string, StoredComplianceLevelsState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, StoredComplianceLevelsState>) : {};
    } catch {
      return {};
    }
  }

  private persist(value: Record<string, StoredComplianceLevelsState>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Keep UX resilient if localStorage is unavailable.
    }
  }

  private cloneState(source: StoredComplianceLevelsState): StoredComplianceLevelsState {
    return {
      updatedAt: source.updatedAt,
      requirements: Object.fromEntries(
        Object.entries(source.requirements).map(([requirementId, requirement]) => [
          requirementId,
          { ...requirement }
        ])
      )
    };
  }
}
