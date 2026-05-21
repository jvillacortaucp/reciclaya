import { RegulatoryLevel } from './regulatory.models';

export type ComplianceRiskLevel = 'low' | 'medium' | 'medium_high' | 'high';
export type ComplianceRequirementActorType = 'seller' | 'buyer' | 'both';
export type ComplianceAcceptedFileType = 'pdf' | 'image';
export type ComplianceRequirementStatus = 'pending' | 'uploaded' | 'in_review' | 'approved' | 'rejected';
export type ComplianceLevelStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ComplianceWasteCategory {
  readonly id: string;
  readonly title: string;
  readonly examples: readonly string[];
}

export interface ComplianceActorRequirementGroup {
  readonly id: string;
  readonly title: string;
  readonly requiredItems: readonly string[];
  readonly recommendedItems: readonly string[];
}

export interface ComplianceValidationRule {
  readonly allowed: readonly string[];
  readonly required: readonly string[];
}

export interface ComplianceTraceability {
  readonly label: string;
  readonly items: readonly string[];
}

export interface ComplianceLegalRisk {
  readonly label: string;
  readonly items: readonly string[];
}

export interface ComplianceRequirement {
  readonly id: string;
  readonly levelId: RegulatoryLevel;
  readonly title: string;
  readonly description: string;
  readonly required: boolean;
  readonly actorType: ComplianceRequirementActorType;
  readonly acceptedFileTypes: readonly ComplianceAcceptedFileType[];
  readonly currentStatus: ComplianceRequirementStatus;
  readonly uploadedFileName: string | null;
  readonly uploadedFileUrl: string | null;
  readonly uploadedFileKind: ComplianceAcceptedFileType | null;
  readonly notes: string | null;
}

export interface ComplianceLevelDefinition {
  readonly id: RegulatoryLevel;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly regularizationLabel: string;
  readonly riskLevel: ComplianceRiskLevel;
  readonly fiscalization: string;
  readonly objective: readonly string[];
  readonly includedWasteCategories: readonly ComplianceWasteCategory[];
  readonly sellerRequirements: readonly ComplianceActorRequirementGroup[];
  readonly buyerRequirements: readonly ComplianceActorRequirementGroup[];
  readonly platformValidations: ComplianceValidationRule;
  readonly restrictions: readonly string[];
  readonly traceability: ComplianceTraceability;
  readonly legalRisks: ComplianceLegalRisk;
  readonly regulations: readonly string[];
  readonly requirementsForUpload: readonly ComplianceRequirement[];
}

export interface ComplianceLevel extends ComplianceLevelDefinition {
  readonly status: ComplianceLevelStatus;
  readonly progress: number;
  readonly completedCount: number;
  readonly pendingCount: number;
  readonly blockedReason: string | null;
}

export interface ComplianceOverview {
  readonly currentLevel: RegulatoryLevel;
  readonly nextLevel: RegulatoryLevel | null;
  readonly progress: number;
  readonly totalRequirements: number;
  readonly completedRequirements: number;
  readonly pendingRequirements: number;
}

export interface ComplianceUploadState {
  readonly requirementId: string;
  readonly currentStatus: ComplianceRequirementStatus;
  readonly uploadedFileName: string | null;
  readonly uploadedFileUrl: string | null;
  readonly uploadedFileKind: ComplianceAcceptedFileType | null;
  readonly notes: string | null;
}

export interface StoredComplianceRequirementState {
  readonly currentStatus: ComplianceRequirementStatus;
  readonly uploadedFileName: string | null;
  readonly uploadedFileKind: ComplianceAcceptedFileType | null;
  readonly notes: string | null;
}

export interface StoredComplianceLevelsState {
  readonly requirements: Record<string, StoredComplianceRequirementState>;
  readonly updatedAt: string | null;
}
