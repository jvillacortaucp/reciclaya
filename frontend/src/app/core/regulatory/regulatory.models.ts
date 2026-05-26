export type RegulatoryLevel = 0 | 1 | 2 | 3 | 4;

export type RegulatoryStatus = 'complete' | 'missing' | 'recommended' | 'not_applicable';

export type RegulatoryActor = 'seller' | 'buyer';

export interface RegulatoryRequirementDefinition {
  readonly code: string;
  readonly label: string;
  readonly actor: RegulatoryActor;
  readonly required: boolean;
  readonly note?: string;
}

export interface RegulatoryRequirementStatus extends RegulatoryRequirementDefinition {
  readonly status: RegulatoryStatus;
}

export interface RegulatoryLevelRule {
  readonly level: RegulatoryLevel;
  readonly title: string;
  readonly shortLabel: string;
  readonly riskLabel: string;
  readonly traceabilityLabel: string;
  readonly sellerRequirements: readonly RegulatoryRequirementDefinition[];
  readonly buyerRequirements: readonly RegulatoryRequirementDefinition[];
  readonly restrictions: readonly string[];
  readonly relatedNorms: readonly string[];
  readonly listingStatusLabel: string;
}

export interface SellerComplianceFlags {
  readonly municipalLicense: boolean;
  readonly sanitaryPermit: boolean;
  readonly storageAuthorization: boolean;
  readonly originDeclaration: boolean;
  readonly wasteClassification: boolean;
  readonly commercialRegistration: boolean;
  readonly internalInventory: boolean;
  readonly manifest: boolean;
  readonly managementPlan: boolean;
  readonly safetyProtocols: boolean;
}

export interface BuyerComplianceFlags {
  readonly municipalLicense: boolean;
  readonly formalOperationEvidence: boolean;
  readonly collectionCenter: boolean;
  readonly sanitaryAuthorization: boolean;
  readonly storageZone: boolean;
  readonly basicManagementPlan: boolean;
  readonly eorsAuthorization: boolean;
  readonly valorizationAuthorization: boolean;
  readonly safeStorage: boolean;
  readonly specializedStorage: boolean;
  readonly operationalTraceability: boolean;
  readonly matpelAuthorization: boolean;
  readonly manifest: boolean;
  readonly emergencyProtocols: boolean;
  readonly environmentalInsurance: boolean;
  readonly operationalMonitoring: boolean;
}

export interface RegulatoryComplianceRecord {
  readonly seller: SellerComplianceFlags;
  readonly buyer: BuyerComplianceFlags;
  readonly updatedAt: string | null;
}

export interface RegulatoryEvaluation {
  readonly rule: RegulatoryLevelRule;
  readonly missingRequired: readonly RegulatoryRequirementStatus[];
  readonly recommendedPending: readonly RegulatoryRequirementStatus[];
  readonly allRequirements: readonly RegulatoryRequirementStatus[];
  readonly eligible: boolean;
}

export interface RegulatoryClassifyInput {
  readonly residueType?: string | null;
  readonly sector?: string | null;
  readonly productType?: string | null;
  readonly specificResidue?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly restrictions?: string | null;
  readonly quantity?: number | null;
  readonly unit?: string | null;
}
