import {
  ComplianceLevel,
  ComplianceLevelDefinition,
  ComplianceOverview,
  ComplianceRequirement,
  ComplianceRequirementStatus,
  StoredComplianceLevelsState
} from '../../../../core/regulatory/compliance-levels.models';
import { RegulatoryLevel } from '../../../../core/regulatory/regulatory.models';

const ACTIVE_STATUSES: readonly ComplianceRequirementStatus[] = ['uploaded', 'in_review', 'approved'];

export function buildComplianceLevels(
  definitions: readonly ComplianceLevelDefinition[],
  state: StoredComplianceLevelsState
): readonly ComplianceLevel[] {
  return definitions.map((definition, index) => {
    const requirementsForUpload = definition.requirementsForUpload.map((requirement) => {
      const stored = state.requirements[requirement.id];
      return stored
        ? {
            ...requirement,
            currentStatus: stored.currentStatus,
            uploadedFileName: stored.uploadedFileName,
            uploadedFileKind: stored.uploadedFileKind,
            notes: stored.notes,
            uploadedFileUrl: requirement.uploadedFileUrl
          }
        : requirement;
    });

    const total = requirementsForUpload.length;
    const approvedCount = requirementsForUpload.filter((requirement) => requirement.currentStatus === 'approved').length;
    const activeCount = requirementsForUpload.filter((requirement) =>
      ACTIVE_STATUSES.includes(requirement.currentStatus)
    ).length;
    const previousLevel = index === 0 ? null : definitions[index - 1].id;
    const previousCompleted = previousLevel === null ? true : isLevelCompleteById(previousLevel, definitions, state);
    const complete = areRequiredRequirementsApproved(requirementsForUpload);
    const hasProgress = requirementsForUpload.some((requirement) => requirement.currentStatus !== 'pending');

    return {
      ...definition,
      requirementsForUpload,
      status: !previousCompleted ? 'locked' : complete ? 'completed' : hasProgress ? 'in_progress' : 'available',
      progress: total ? Math.round((activeCount / total) * 100) : 0,
      completedCount: approvedCount,
      pendingCount: total - approvedCount,
      blockedReason: !previousCompleted ? `Completa el Nivel ${previousLevel} para habilitar este bloque.` : null
    };
  });
}

export function buildComplianceOverview(levels: readonly ComplianceLevel[]): ComplianceOverview {
  const totalRequirements = levels.reduce((sum, level) => sum + level.requirementsForUpload.length, 0);
  const completedRequirements = levels.reduce((sum, level) => sum + level.completedCount, 0);
  const pendingRequirements = Math.max(totalRequirements - completedRequirements, 0);
  const currentCompletedLevel = [...levels]
    .reverse()
    .find((level) => level.status === 'completed')?.id ?? 0;
  const nextLevel = currentCompletedLevel < 4 ? ((Math.max(1, currentCompletedLevel + 1)) as RegulatoryLevel) : null;
  const activeRequirements = levels.reduce(
    (sum, level) =>
      sum + level.requirementsForUpload.filter((requirement) => ACTIVE_STATUSES.includes(requirement.currentStatus)).length,
    0
  );

  return {
    currentLevel: currentCompletedLevel as RegulatoryLevel,
    nextLevel,
    progress: totalRequirements ? Math.round((activeRequirements / totalRequirements) * 100) : 0,
    totalRequirements,
    completedRequirements,
    pendingRequirements
  };
}

function areRequiredRequirementsApproved(requirements: readonly ComplianceRequirement[]): boolean {
  return requirements.every((requirement) => !requirement.required || requirement.currentStatus === 'approved');
}

function isLevelCompleteById(
  levelId: RegulatoryLevel,
  definitions: readonly ComplianceLevelDefinition[],
  state: StoredComplianceLevelsState
): boolean {
  const level = definitions.find((item) => item.id === levelId);
  if (!level) {
    return false;
  }

  return level.requirementsForUpload.every((requirement) => {
    const stored = state.requirements[requirement.id];
    const status = stored?.currentStatus ?? requirement.currentStatus;
    return !requirement.required || status === 'approved';
  });
}
