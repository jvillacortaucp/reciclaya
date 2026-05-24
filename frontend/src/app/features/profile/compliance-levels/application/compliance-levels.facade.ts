import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import {
  ComplianceAcceptedFileType,
  ComplianceLevelDefinition,
  ComplianceLevel,
  ComplianceOverview,
  ComplianceRequirementStatus,
  StoredComplianceLevelsState,
  StoredComplianceRequirementState
} from '../../../../core/regulatory/compliance-levels.models';
import { COMPLIANCE_INITIAL_STATE } from '../../../../core/regulatory/compliance-levels.constants';
import { RegulationLevelResponse, RegulationMeResponse } from '../../../../core/regulatory/regulation-api.models';
import { RegulationHttpService } from '../../../../core/regulatory/regulation-http.service';
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
  private readonly regulationHttpService = inject(RegulationHttpService);
  private readonly activeUserId = signal<string>('anonymous');
  private readonly state = signal<StoredComplianceLevelsState>(this.cloneStoredState(COMPLIANCE_INITIAL_STATE));
  private readonly definitions = signal<readonly ComplianceLevelDefinition[]>([]);
  private readonly meState = signal<RegulationMeResponse | null>(null);
  private readonly dirty = signal(false);
  private readonly runtimeUploads = new Map<string, RuntimeUploadAsset>();

  readonly levels = computed<readonly ComplianceLevel[]>(() =>
    buildComplianceLevels(this.hydratedDefinitions(), this.state())
  );
  readonly overview = computed<ComplianceOverview>(() => {
    const localOverview = buildComplianceOverview(this.levels());
    const me = this.meState();
    if (!me) {
      return localOverview;
    }

    const level = this.parseLevelSlug(me.currentRegulationLevel);
    const nextLevel = me.nextLevel ? this.parseLevelSlug(me.nextLevel) : null;
    const total = me.requirementsSummary.total;
    const approved = me.requirementsSummary.approved;
    const pending = me.requirementsSummary.pending;

    return {
      currentLevel: level,
      nextLevel,
      progress: total > 0 ? Math.round((approved / total) * 100) : 0,
      totalRequirements: total,
      completedRequirements: approved,
      pendingRequirements: pending
    };
  });
  readonly hasUnsavedChanges = computed(() => this.dirty());
  readonly lastSavedAt = computed(() => this.state().updatedAt);
  readonly currentRegulationLevel = computed(() => this.parseLevelSlug(this.meState()?.currentRegulationLevel ?? 'level0'));
  readonly canTransact = computed(() => this.meState()?.canTransact ?? false);

  initialize(userId: string | null | undefined): void {
    this.activeUserId.set(userId?.trim() || 'anonymous');
    forkJoin({
      me: this.regulationHttpService.getMe(),
      levels: this.regulationHttpService.getLevels()
    })
      .pipe(
        catchError(() =>
          of({
            me: null,
            levels: [] as readonly RegulationLevelResponse[]
          })
        )
      )
      .subscribe(({ me, levels }) => {
        const fallbackState = this.loadUserCompliance(this.activeUserId());
        this.clearRuntimeUploads();
        this.meState.set(me);

        if (levels.length === 0) {
          this.definitions.set([]);
          this.state.set(fallbackState);
          this.dirty.set(false);
          return;
        }

        const mappedDefinitions = levels.map((level) => this.mapApiLevel(level));
        this.definitions.set(mappedDefinitions);
        this.state.set(this.buildStateFromApiLevels(levels, fallbackState));
        this.dirty.set(false);
      });
  }

  loadLevels(): readonly ComplianceLevel[] {
    return this.levels();
  }

  loadUserCompliance(userId: string): StoredComplianceLevelsState {
    return this.cloneStoredState(this.complianceLevelsStore.getUserState(userId));
  }

  attachFile(requirementId: string, file: File): void {
    this.uploadRequirementEvidence(requirementId, file).catch(() => {
      this.patchRequirement(requirementId, {
        currentStatus: 'pending',
        uploadedFileName: file.name,
        uploadedFileKind: this.resolveFileKind(file),
        notes: 'No se pudo subir el archivo. Intenta nuevamente.'
      });
      this.dirty.set(true);
    });
  }

  removeFile(requirementId: string): void {
    this.deleteRequirementEvidence(requirementId).catch(() => {
      this.patchRequirement(requirementId, {
        notes: 'No se pudo eliminar la evidencia. Intenta nuevamente.'
      });
      this.dirty.set(true);
    });
  }

  updateRequirementStatus(requirementId: string, status: ComplianceRequirementStatus, notes?: string | null): void {
    this.patchRequirement(requirementId, {
      currentStatus: status,
      notes: notes ?? this.state().requirements[requirementId]?.notes ?? null
    });
    this.dirty.set(true);
  }

  saveDraft(): void {
    const nextUpdatedAt = new Date().toISOString();
    this.state.update((current) => ({ ...current, updatedAt: nextUpdatedAt }));
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
    if (current?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(current.url);
    }
    this.runtimeUploads.delete(requirementId);
  }

  private clearRuntimeUploads(): void {
    [...this.runtimeUploads.keys()].forEach((requirementId) => this.revokeUpload(requirementId));
  }

  private hydratedDefinitions(): readonly ComplianceLevelDefinition[] {
    return this.definitions().map((level) => ({
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

  private mapApiLevel(level: RegulationLevelResponse): ComplianceLevelDefinition {
    return {
      id: level.id as 1 | 2 | 3 | 4,
      slug: level.slug,
      title: level.title,
      subtitle: level.subtitle,
      regularizationLabel: level.regularizationLabel,
      riskLevel: this.normalizeRiskLevel(level.riskLevel),
      fiscalization: level.fiscalization,
      objective: [...level.objective],
      includedWasteCategories: level.includedWasteCategories.map((item) => ({
        id: item.id,
        title: item.title,
        examples: [...item.examples]
      })),
      sellerRequirements: level.sellerRequirements.map((item) => ({
        id: item.id,
        title: item.title,
        requiredItems: [...item.requiredItems],
        recommendedItems: [...item.recommendedItems]
      })),
      buyerRequirements: level.buyerRequirements.map((item) => ({
        id: item.id,
        title: item.title,
        requiredItems: [...item.requiredItems],
        recommendedItems: [...item.recommendedItems]
      })),
      platformValidations: {
        allowed: [...level.platformValidations.allowed],
        required: [...level.platformValidations.required]
      },
      restrictions: [...level.restrictions],
      traceability: {
        label: level.traceability.label,
        items: [...level.traceability.items]
      },
      legalRisks: {
        label: level.legalRisks.label,
        items: [...level.legalRisks.items]
      },
      regulations: [...level.regulations],
      requirementsForUpload: level.requirementsForUpload.map((requirement) => ({
        id: requirement.id,
        levelId: requirement.levelId as 1 | 2 | 3 | 4,
        title: requirement.title,
        description: requirement.description,
        required: requirement.required,
        actorType: requirement.actorType,
        acceptedFileTypes: requirement.acceptedFileTypes,
        currentStatus: requirement.currentStatus,
        uploadedFileName: requirement.uploadedFileName,
        uploadedFileUrl: requirement.uploadedFileUrl,
        uploadedFileKind: requirement.uploadedFileKind,
        notes: requirement.notes
      }))
    };
  }

  private buildStateFromApiLevels(
    levels: readonly RegulationLevelResponse[],
    fallbackState: StoredComplianceLevelsState
  ): StoredComplianceLevelsState {
    const requirements = Object.fromEntries(
      levels.flatMap((level) =>
        level.requirementsForUpload.map((requirement) => [
          requirement.id,
          {
            currentStatus: requirement.currentStatus,
            uploadedFileName: requirement.uploadedFileName,
            uploadedFileKind: requirement.uploadedFileKind,
            notes: requirement.notes
          }
        ])
      )
    );

    return {
      updatedAt: fallbackState.updatedAt,
      requirements
    };
  }

  private parseLevelSlug(level: string): 0 | 1 | 2 | 3 | 4 {
    if (!level.startsWith('level')) {
      return 0;
    }

    const parsed = Number(level.slice(5));
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return Math.max(0, Math.min(4, parsed)) as 0 | 1 | 2 | 3 | 4;
  }

  private normalizeRiskLevel(value: string): 'low' | 'medium' | 'medium_high' | 'high' {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'high') {
      return 'high';
    }
    if (normalized === 'medium_high' || normalized === 'medium-high') {
      return 'medium_high';
    }
    if (normalized === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private resolveFileKind(file: File): ComplianceAcceptedFileType {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    return 'document';
  }

  private async uploadRequirementEvidence(requirementId: string, file: File): Promise<void> {
    const response = await firstValueFrom(this.regulationHttpService.uploadRequirementEvidence(requirementId, file));

    this.patchRequirement(requirementId, {
      currentStatus: response.currentStatus,
      uploadedFileName: response.uploadedFileName,
      uploadedFileKind: response.uploadedFileKind,
      notes: response.notes
    });

    this.state.update((current) => ({
      ...current,
      updatedAt: new Date().toISOString()
    }));
    this.dirty.set(false);

    this.revokeUpload(requirementId);
    if (response.uploadedFileKind === 'image') {
      this.runtimeUploads.set(requirementId, {
        file,
        url: URL.createObjectURL(file),
        kind: 'image'
      });
    }
  }

  private async deleteRequirementEvidence(requirementId: string): Promise<void> {
    const response = await firstValueFrom(this.regulationHttpService.deleteRequirementEvidence(requirementId));

    this.revokeUpload(requirementId);
    this.patchRequirement(requirementId, {
      currentStatus: response.currentStatus,
      uploadedFileName: null,
      uploadedFileKind: null,
      notes: response.notes
    });

    this.state.update((current) => ({
      ...current,
      updatedAt: new Date().toISOString()
    }));
    this.dirty.set(false);
  }
}
