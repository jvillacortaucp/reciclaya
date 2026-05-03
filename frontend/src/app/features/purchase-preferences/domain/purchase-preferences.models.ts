import {
  DeliveryMode,
  ExchangeType,
  ProductCategory,
  ResidueType,
  SectorType
} from '../../../core/enums/marketplace.enums';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  readonly helper?: string;
}

export type PurchaseUnit = 'tons' | 'kg' | 'm3';
export type PurchaseFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly' | 'recurring';
export type MaterialCondition = 'fresh' | 'dry' | 'wet' | 'processed';
export type PreferredMode = DeliveryMode | 'either';
export type AcceptedExchangeType = ExchangeType | 'either';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface DesiredResidueData {
  readonly residueType: ResidueType;
  readonly sector: SectorType;
  readonly productType: ProductCategory;
  readonly specificResidue: string;
}

export interface SourcingPreferencesData {
  readonly requiredVolume: number;
  readonly unit: PurchaseUnit;
  readonly purchaseFrequency: PurchaseFrequency;
  readonly minPriceUsd: number | null;
  readonly maxPriceUsd: number | null;
  readonly desiredCondition: MaterialCondition;
}

export interface LogisticsPreferencesData {
  readonly receivingLocation: string;
  readonly radiusKm: number;
  readonly preferredMode: PreferredMode;
  readonly acceptedExchangeType: AcceptedExchangeType;
}

export interface AlertPreferencesData {
  readonly notes: string;
  readonly alertOnMatch: boolean;
  readonly priority: PriorityLevel;
}

export interface PurchasePreferenceFormValue {
  readonly desiredResidue: DesiredResidueData;
  readonly sourcing: SourcingPreferencesData;
  readonly logistics: LogisticsPreferencesData;
  readonly alerts: AlertPreferencesData;
}

export interface ProfileStatus {
  readonly completionPercentage: number;
  readonly title: string;
  readonly subtitle: string;
  readonly recommendation: string;
}

export interface MatchProjection {
  readonly suppliersCount: number;
  readonly directMatchCount: number;
  readonly potentialMatchCount: number;
  readonly projectedSavingsLabel: string;
}

export interface SummaryPreviewData {
  readonly materialLabel: string;
  readonly volumeLabel: string;
  readonly logisticsLabel: string;
  readonly urgencyLabel: string;
}

export interface PurchasePreferencesPageState {
  readonly formValue: PurchasePreferenceFormValue;
  readonly profileStatus: ProfileStatus;
  readonly projection: MatchProjection;
  readonly smartRecommendationNote: string;
  readonly draftSavedAt: string | null;
}

