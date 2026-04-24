export type ComplexityLevel = 'low' | 'medium' | 'high';

export type MarketPotential = 'low' | 'medium' | 'high';

export type ValueRouteIconName =
  | 'utensils'
  | 'sparkles'
  | 'pill'
  | 'sprout'
  | 'flame'
  | 'microscope'
  | 'flask-conical'
  | 'droplets'
  | 'hammer'
  | 'package'
  | 'store';

export type ValueRouteProductIconName =
  | 'leaf'
  | 'cookie'
  | 'sparkles'
  | 'droplets'
  | 'pill'
  | 'microscope'
  | 'zap'
  | 'package'
  | 'beaker'
  | 'factory';

export interface ValueRouteProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly complexity: ComplexityLevel;
  readonly marketPotential: MarketPotential;
  readonly potentialUse: string;
  readonly iconName: ValueRouteProductIconName;
}

export interface ValueRoute {
  readonly id: string;
  readonly routeName: string;
  readonly shortDescription: string;
  readonly iconName: ValueRouteIconName;
  readonly marketPotential: MarketPotential;
  readonly targetIndustries: readonly string[];
  readonly products: readonly ValueRouteProduct[];
  readonly insight: string;
  readonly heroImageUrl: string;
}

export interface ValueRoutesPageResponse {
  readonly items: readonly ValueRoute[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly hasMore: boolean;
}

export interface ValueRouteSelectionSummary {
  readonly routeName: string;
  readonly productName: string;
  readonly complexity: ComplexityLevel;
  readonly potential: MarketPotential;
  readonly targetIndustries: readonly string[];
  readonly insight: string;
  readonly imageUrl: string;
  readonly potentialUse: string;
}
