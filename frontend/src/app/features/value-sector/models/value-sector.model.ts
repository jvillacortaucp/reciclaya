export type ComplexityLevel = 'low' | 'medium' | 'high';
export type MarketPotential = 'low' | 'medium' | 'high';

export interface ValueSectorProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly complexity: ComplexityLevel;
  readonly marketPotential: MarketPotential;
  readonly potentialUse: string;
  readonly processOverview?: string;
  readonly requiredConditions?: readonly string[];
  readonly potentialBuyers?: readonly string[];
  readonly warnings?: readonly string[];
  readonly source?: 'deepseek' | 'fallback' | 'manual' | string;
  readonly sellerRecommendation?: string;
  readonly buyerRecommendation?: string;
}

export interface ValueSectorRoute {
  readonly id: string;
  readonly routeName: string;
  readonly shortDescription: string;
  readonly iconName: string;
  readonly marketPotential: MarketPotential;
  readonly targetIndustries: readonly string[];
  readonly products: readonly ValueSectorProduct[];
  readonly insight: string;
  readonly heroImageUrl: string;
  readonly source?: 'deepseek' | 'fallback' | 'manual' | string;
}

export interface ValueSectorPageResponse {
  readonly items: readonly ValueSectorRoute[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
}

export interface ValueSectorListingSummary {
  readonly id: string;
  readonly specificResidue: string;
  readonly productType: string;
  readonly wasteType: string;
  readonly sector: string;
  readonly description: string;
  readonly condition: string;
  readonly quantity: number;
  readonly unit: string;
  readonly location: string;
  readonly exchangeType: string;
  readonly status: string;
}

export interface ValueSectorFromListingResponse {
  readonly listing: ValueSectorListingSummary;
  readonly routes: readonly ValueSectorRoute[];
}

export interface ValueSectorSelectionSummary {
  readonly routeName: string;
  readonly productName: string;
  readonly complexity: ComplexityLevel;
  readonly potential: MarketPotential;
  readonly targetIndustries: readonly string[];
  readonly insight: string;
  readonly imageUrl: string;
  readonly potentialUse: string;
  readonly source?: 'deepseek' | 'fallback' | 'manual' | string;
  readonly buyerBenefit?: string;
  readonly suggestedAction?: string;
  readonly recommendedUse?: string;
  readonly risks?: readonly string[];
  readonly nextStep?: string;
  readonly confidenceScore?: number;
}
