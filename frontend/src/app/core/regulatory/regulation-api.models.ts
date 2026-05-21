import { ApiResponse } from '../models/app.models';

export interface RegulationMeResponse {
  readonly currentRegulationLevel: 'level0' | 'level1' | 'level2' | 'level3' | 'level4';
  readonly canTransact: boolean;
  readonly nextLevel: 'level1' | 'level2' | 'level3' | 'level4' | null;
  readonly requirementsSummary: {
    readonly total: number;
    readonly approved: number;
    readonly pending: number;
  };
}

export interface RegulationLevelResponse {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly regularizationLabel: string;
  readonly riskLevel: 'low' | 'medium' | 'medium_high' | 'high' | string;
  readonly fiscalization: string;
  readonly objective: readonly string[];
  readonly includedWasteCategories: readonly {
    readonly id: string;
    readonly title: string;
    readonly examples: readonly string[];
  }[];
  readonly sellerRequirements: readonly {
    readonly id: string;
    readonly title: string;
    readonly requiredItems: readonly string[];
    readonly recommendedItems: readonly string[];
  }[];
  readonly buyerRequirements: readonly {
    readonly id: string;
    readonly title: string;
    readonly requiredItems: readonly string[];
    readonly recommendedItems: readonly string[];
  }[];
  readonly platformValidations: {
    readonly allowed: readonly string[];
    readonly required: readonly string[];
  };
  readonly restrictions: readonly string[];
  readonly traceability: {
    readonly label: string;
    readonly items: readonly string[];
  };
  readonly legalRisks: {
    readonly label: string;
    readonly items: readonly string[];
  };
  readonly regulations: readonly string[];
  readonly requirementsForUpload: readonly {
    readonly id: string;
    readonly levelId: number;
    readonly title: string;
    readonly description: string;
    readonly required: boolean;
    readonly actorType: 'seller' | 'buyer' | 'both';
    readonly acceptedFileTypes: readonly ('pdf' | 'image' | 'document')[];
    readonly currentStatus: 'pending' | 'uploaded' | 'in_review' | 'approved' | 'rejected';
    readonly uploadedFileName: string | null;
    readonly uploadedFileUrl: string | null;
    readonly uploadedFileKind: 'pdf' | 'image' | 'document' | null;
    readonly notes: string | null;
  }[];
}

export interface RegulationRequirementUploadResult {
  readonly id: string;
  readonly levelId: number;
  readonly title: string;
  readonly description: string;
  readonly required: boolean;
  readonly actorType: 'seller' | 'buyer' | 'both';
  readonly acceptedFileTypes: readonly ('pdf' | 'image' | 'document')[];
  readonly currentStatus: 'pending' | 'uploaded' | 'in_review' | 'approved' | 'rejected';
  readonly uploadedFileName: string | null;
  readonly uploadedFileUrl: string | null;
  readonly uploadedFileKind: 'pdf' | 'image' | 'document' | null;
  readonly notes: string | null;
}

export interface RegulationRequirementReviewItemResponse {
  readonly requirementRecordId: string;
  readonly userId: string;
  readonly requesterName: string;
  readonly companyName: string;
  readonly ruc: string | null;
  readonly levelId: number;
  readonly requirementCode: string;
  readonly requirementTitle: string;
  readonly actorType: 'seller' | 'buyer' | 'both' | string;
  readonly currentStatus: 'uploaded' | 'in_review' | 'approved' | 'rejected' | string;
  readonly uploadedFileName: string | null;
  readonly uploadedFileKind: 'pdf' | 'image' | 'document' | null;
  readonly evidenceUrl: string | null;
  readonly notes: string | null;
  readonly reviewDeadlineAt: string | null;
  readonly isOverdue: boolean;
  readonly approvalExpiresAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegulationRequirementReviewPageResponse {
  readonly items: readonly RegulationRequirementReviewItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
}

export interface RegulationRequirementReviewRequest {
  readonly status: 'approved' | 'rejected' | 'in_review';
  readonly notes?: string | null;
  readonly expiresAt?: string | null;
}

export interface RegulationValidateOperationRequest {
  readonly action: 'publish' | 'buy' | 'negotiate' | 'confirm_purchase';
  readonly actor?: 'seller' | 'buyer';
  readonly residueType?: string | null;
  readonly sector?: string | null;
  readonly productType?: string | null;
  readonly specificResidue?: string | null;
  readonly quantity?: number | null;
  readonly unit?: string | null;
}

export interface RegulationValidationResult {
  readonly allowed: boolean;
  readonly requiredMinLevel: string;
  readonly actorCurrentLevel: string;
  readonly blockingReasonCode: string | null;
  readonly blockingMessage: string;
  readonly upgradeCallToAction: string;
  readonly missingRequirements: readonly string[];
  readonly manualReviewRequired: boolean;
}

export type RegulationMeApiResponse = ApiResponse<RegulationMeResponse>;
export type RegulationLevelsApiResponse = ApiResponse<readonly RegulationLevelResponse[]>;
export type RegulationValidateApiResponse = ApiResponse<RegulationValidationResult>;
export type RegulationUploadRequirementApiResponse = ApiResponse<RegulationRequirementUploadResult>;
export type RegulationReviewPageApiResponse = ApiResponse<RegulationRequirementReviewPageResponse>;
