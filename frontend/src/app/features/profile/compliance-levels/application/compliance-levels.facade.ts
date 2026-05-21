import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  ComplianceAcceptedFileType,
  ComplianceLevelDefinition,
  ComplianceLevel,
  ComplianceOverview,
  ComplianceRequirementStatus,
  StoredComplianceLevelsState,
  StoredComplianceRequirementState
} from '../../../../core/regulatory/compliance-levels.models';
import { COMPLIANCE_INITIAL_STATE, COMPLIANCE_LEVEL_DEFINITIONS } from '../../../../core/regulatory/compliance-levels.constants';
import { ComplianceLevelsStore } from '../../../../core/regulatory/compliance-levels.store';
import { buildComplianceLevels, buildComplianceOverview } from '../domain/compliance-levels.utils';

interface RuntimeUploadAsset {
  readonly file: File;
  readonly url: string | null;
  readonly kind: ComplianceAcceptedFileType;
}

@Injectable()
export class ComplianceLevelsFacade implements OnDestroy {
  private readonly complianceLevelsStore = inject(ComplianceLevelsStore);
  private readonly activeUserId = signal<string>('anonymous');
  private readonly state = signal<StoredComplianceLevelsState>(this.cloneStoredState(COMPLIANCE_INITIAL_STATE));
  private readonly dirty = signal(false);
  private readonly runtimeUploads = new Map<string, RuntimeUploadAsset>();

  readonly levels = computed<readonly ComplianceLevel[]>(() =>
    buildComplianceLevels(this.hydratedDefinitions(), this.state())
  );
  readonly overview = computed<ComplianceOverview>(() => buildComplianceOverview(this.levels()));
  readonly hasUnsavedChanges = computed(() => this.dirty());
  readonly lastSavedAt = computed(() => this.state().updatedAt);

  initialize(userId: string | null | undefined): void {
    this.activeUserId.set(userId?.trim() || 'anonymous');
    const nextState = this.loadUserCompliance(this.activeUserId());
    this.clearRuntimeUploads();
    this.state.set(nextState);
    this.dirty.set(false);
  }

  loadLevels(): readonly ComplianceLevel[] {
    return this.levels();
  }

  loadUserCompliance(userId: string): StoredComplianceLevelsState {
    return this.cloneStoredState(this.complianceLevelsStore.getUserState(userId));
  }

  attachFile(requirementId: string, file: File): void {
    const kind: ComplianceAcceptedFileType = file.type === 'application/pdf' ? 'pdf' : 'image';
    this.revokeUpload(requirementId);

    const runtimeUrl = kind === 'image' ? URL.createObjectURL(file) : null;
    this.runtimeUploads.set(requirementId, { file, url: runtimeUrl, kind });
    this.patchRequirement(requirementId, {
      currentStatus: 'uploaded',
      uploadedFileName: file.name,
      uploadedFileKind: kind,
      notes: 'Archivo listo para revisión local.'
    });
    this.dirty.set(true);
  }

  removeFile(requirementId: string): void {
    this.revokeUpload(requirementId);
    this.patchRequirement(requirementId, {
      currentStatus: 'pending',
      uploadedFileName: null,
      uploadedFileKind: null,
      notes: null
    });
    this.dirty.set(true);
  }

  updateRequirementStatus(requirementId: string, status: ComplianceRequirementStatus, notes?: string | null): void {
    this.patchRequirement(requirementId, {
      currentStatus: status,
      notes: notes ?? this.state().requirements[requirementId]?.notes ?? null
    });
    this.dirty.set(true);
  }

  saveDraft(): void {
    const userId = this.activeUserId();
    const nextState = {
      ...this.state(),
      updatedAt: new Date().toISOString()
    };
    this.complianceLevelsStore.saveUserState(userId, nextState);
    this.state.update((current) => ({ ...current, updatedAt: nextState.updatedAt }));
    this.dirty.set(false);
  }

  ngOnDestroy(): void {
    this.clearRuntimeUploads();
  }

  private patchRequirement(requirementId: string, patch: Partial<StoredComplianceRequirementState>): void {
    this.state.update((current) => ({
      ...current,
      requirements: {
        ...current.requirements,
        [requirementId]: {
          ...(current.requirements[requirementId] ?? {
            currentStatus: 'pending',
            uploadedFileName: null,
            uploadedFileKind: null,
            notes: null
          }),
          ...patch
        }
      }
    }));
  }

  private cloneStoredState(source: StoredComplianceLevelsState): StoredComplianceLevelsState {
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

  private revokeUpload(requirementId: string): void {
    const current = this.runtimeUploads.get(requirementId);
    if (current?.url) {
      URL.revokeObjectURL(current.url);
    }
    this.runtimeUploads.delete(requirementId);
  }

  private clearRuntimeUploads(): void {
    [...this.runtimeUploads.keys()].forEach((requirementId) => this.revokeUpload(requirementId));
  }

  private hydratedDefinitions(): readonly ComplianceLevelDefinition[] {
    return COMPLIANCE_LEVEL_DEFINITIONS.map((level) => ({
      ...level,
      requirementsForUpload: level.requirementsForUpload.map((requirement) => {
        const runtime = this.runtimeUploads.get(requirement.id);
        return runtime
          ? {
              ...requirement,
              uploadedFileName: runtime.file.name,
              uploadedFileUrl: runtime.url,
              uploadedFileKind: runtime.kind
            }
          : requirement;
      })
    }));
  }
}
