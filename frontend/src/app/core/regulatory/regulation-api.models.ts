import { ApiResponse } from '../models/app.models';

export interface RegulationMeResponse {
  currentRegulationLevel: 'level0' | 'level1' | 'level2' | 'level3' | 'level4';
  canTransact: boolean;
  nextLevel: 'level1' | 'level2' | 'level3' | 'level4' | null;
  requirementsSummary: {
    total: number;
    approved: number;
    pending: number;
  };
}

export interface RegulationLevelResponse {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  regularizationLabel: string;
  riskLevel: 'low' | 'medium' | 'medium_high' | 'high' | string;
  fiscalization: string;
  objective: string[];
  includedWasteCategories: {
    id: string;
    title: string;
    examples: string[];
  }[];
  sellerRequirements: {
    id: string;
    title: string;
    requiredItems: string[];
    recommendedItems: string[];
  }[];
  buyerRequirements: {
    id: string;
    title: string;
    requiredItems: string[];
    recommendedItems: string[];
  }[];
  platformValidations: {
    allowed: string[];
    required: string[];
  };
  restrictions: string[];
  traceability: {
    label: string;
    items: string[];
  };
  legalRisks: {
    label: string;
    items: string[];
  };
  regulations: string[];
  requirementsForUpload: {
    id: string;
    levelId: number;
    title: string;
    description: string;
    required: boolean;
    actorType: 'seller' | 'buyer' | 'both';
    acceptedFileTypes: ('pdf' | 'image' | 'document')[];
    currentStatus: 'pending' | 'uploaded' | 'in_review' | 'approved' | 'rejected';
    uploadedFileName: string | null;
    uploadedFileUrl: string | null;
    uploadedFileKind: 'pdf' | 'image' | 'document' | null;
    notes: string | null;
  }[];
}

export interface RegulationRequirementUploadResult {
  id: string;
  levelId: number;
  title: string;
  description: string;
  required: boolean;
  actorType: 'seller' | 'buyer' | 'both';
  acceptedFileTypes: ('pdf' | 'image' | 'document')[];
  currentStatus: 'pending' | 'uploaded' | 'in_review' | 'approved' | 'rejected';
  uploadedFileName: string | null;
  uploadedFileUrl: string | null;
  uploadedFileKind: 'pdf' | 'image' | 'document' | null;
  notes: string | null;
}

export interface RegulationRequirementReviewItemResponse {
  requirementRecordId: string;
  userId: string;
  requesterName: string;
  companyName: string;
  ruc: string | null;
  levelId: number;
  requirementCode: string;
  requirementTitle: string;
  actorType: 'seller' | 'buyer' | 'both' | string;
  currentStatus: 'uploaded' | 'in_review' | 'approved' | 'rejected' | string;
  uploadedFileName: string | null;
  uploadedFileKind: 'pdf' | 'image' | 'document' | null;
  evidenceUrl: string | null;
  notes: string | null;
  reviewDeadlineAt: string | null;
  isOverdue: boolean;
  approvalExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegulationRequirementReviewPageResponse {
  items: RegulationRequirementReviewItemResponse[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface RegulationRequirementReviewRequest {
  status: 'approved' | 'rejected' | 'in_review';
  notes?: string | null;
  expiresAt?: string | null;
}

export interface RegulationValidateOperationRequest {
  action: 'publish' | 'buy' | 'negotiate' | 'confirm_purchase';
  actor?: 'seller' | 'buyer';
  residueType?: string | null;
  sector?: string | null;
  productType?: string | null;
  specificResidue?: string | null;
  quantity?: number | null;
  unit?: string | null;
}

export interface RegulationValidationResult {
  allowed: boolean;
  requiredMinLevel: string;
  actorCurrentLevel: string;
  blockingReasonCode: string | null;
  blockingMessage: string;
  upgradeCallToAction: string;
  missingRequirements: string[];
  manualReviewRequired: boolean;
}

export interface RegulationEvidenceVerificationRequest {
  specificResidue?: string | null;
  residueType?: string | null;
  sector?: string | null;
  productType?: string | null;
  shortDescription?: string | null;
  quantity?: number | null;
  unit?: string | null;
  mediaUrls?: readonly string[] | null;
}

export interface RegulationEvidenceVerificationResult {
  isConsistent: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | string;
  suggestedResidue: string | null;
  riskFlags: readonly string[];
  manualReviewRequired: boolean;
  message: string;
}

export interface RegulationEvidencePrecheckResult {
  regulation: RegulationValidationResult;
  evidence: RegulationEvidenceVerificationResult;
  finalAllowed: boolean;
  blockingReasonCode: string | null;
  blockingMessage: string;
}

export type RegulationMeApiResponse = ApiResponse<RegulationMeResponse>;
export type RegulationLevelsApiResponse = ApiResponse<RegulationLevelResponse[]>;
export type RegulationValidateApiResponse = ApiResponse<RegulationValidationResult>;
export type RegulationEvidenceVerifyApiResponse = ApiResponse<RegulationEvidencePrecheckResult>;
export type RegulationUploadRequirementApiResponse = ApiResponse<RegulationRequirementUploadResult>;
export type RegulationReviewPageApiResponse = ApiResponse<RegulationRequirementReviewPageResponse>;

export interface RegulationAdminCatalogLevelResponse {
  levelId: number;
  slug: string;
  title: string;
  subtitle: string;
  regularizationLabel: string;
  riskLevel: string;
  fiscalization: string;
  objective: string[];
  restrictions: string[];
  platformAllowed: string[];
  platformRequired: string[];
  traceabilityItems: string[];
  legalRiskItems: string[];
  requirements: RegulationAdminRequirementResponse[];
  allowedResidues: RegulationAdminAllowedResidueResponse[];
  normatives: RegulationAdminNormativeResponse[];
}

export interface RegulationAdminCatalogResponse {
  activeVersion: number;
  levels: RegulationAdminCatalogLevelResponse[];
}

export interface RegulationAdminRequirementResponse {
  id: string;
  levelId: number;
  requirementCode: string;
  title: string;
  description: string;
  required: boolean;
  actorType: 'seller' | 'buyer' | 'both';
  acceptedFileTypes: ('pdf' | 'image' | 'document')[];
  sortOrder: number;
  isActive: boolean;
}

export interface RegulationAdminAllowedResidueResponse {
  id: string;
  levelId: number;
  categoryId: string;
  categoryTitle: string;
  residueName: string;
  quantityMin: number | null;
  quantityMax: number | null;
  unit: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface RegulationAdminNormativeResponse {
  id: string;
  levelId: number;
  code: string;
  title: string;
  article: string | null;
  referenceUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface RegulationAdminLevelUpdateRequest {
  title: string;
  subtitle: string;
  regularizationLabel: string;
  riskLevel: string;
  fiscalization: string;
  objective: string[];
  restrictions: string[];
  platformAllowed: string[];
  platformRequired: string[];
  traceabilityItems: string[];
  legalRiskItems: string[];
}

export interface RegulationAdminRequirementUpsertRequest {
  requirementCode: string;
  title: string;
  description: string;
  required: boolean;
  actorType: 'seller' | 'buyer' | 'both';
  acceptedFileTypes: ('pdf' | 'image' | 'document')[];
  sortOrder: number;
  isActive: boolean;
}

export interface RegulationAdminAllowedResidueUpsertRequest {
  categoryId: string;
  categoryTitle: string;
  residueName: string;
  quantityMin: number | null;
  quantityMax: number | null;
  unit: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface RegulationAdminNormativeUpsertRequest {
  code: string;
  title: string;
  article: string | null;
  referenceUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type RegulationAdminCatalogApiResponse = ApiResponse<RegulationAdminCatalogResponse>;
export type RegulationAdminLevelApiResponse = ApiResponse<RegulationAdminCatalogLevelResponse>;
export type RegulationAdminRequirementApiResponse = ApiResponse<RegulationAdminRequirementResponse>;
export type RegulationAdminAllowedResidueApiResponse = ApiResponse<RegulationAdminAllowedResidueResponse>;
export type RegulationAdminNormativeApiResponse = ApiResponse<RegulationAdminNormativeResponse>;

