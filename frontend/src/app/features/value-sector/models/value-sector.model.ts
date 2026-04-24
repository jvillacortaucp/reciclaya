export type ComplexityLevel = 'low' | 'medium' | 'high';
export type MarketPotential = 'low' | 'medium' | 'high';

export interface ValueSectorProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly complexity: ComplexityLevel;
  readonly marketPotential: MarketPotential;
  readonly potentialUse: string;
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
}

export interface ValueSectorPageResponse {
  readonly items: readonly ValueSectorRoute[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
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
}
