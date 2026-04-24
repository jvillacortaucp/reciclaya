export type ValueRouteComplexity = 'baja' | 'media' | 'alta';

export type ValueRoutePotential = 'medio' | 'alto' | 'muy-alto';

export type ValueRouteProductIcon =
  | 'leaf'
  | 'cookie'
  | 'sparkles'
  | 'droplets'
  | 'pill'
  | 'microscope'
  | 'zap'
  | 'package'
  | 'beaker';

export interface ValueRouteProduct {
  readonly id: string;
  readonly name: string;
  readonly icon: ValueRouteProductIcon;
  readonly shortDescription: string;
}

export interface ValueRoute {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon:
    | 'utensils'
    | 'sparkles'
    | 'pill'
    | 'microscope'
    | 'zap'
    | 'package';
  readonly complexity: ValueRouteComplexity;
  readonly potential: ValueRoutePotential;
  readonly products: readonly ValueRouteProduct[];
  readonly targetIndustries: readonly string[];
  readonly valueInsight: string;
  readonly heroImageUrl: string;
  readonly displayOrder: number;
}

export interface ValueRouteSelectionSummary {
  readonly routeName: string;
  readonly productName: string;
  readonly complexity: ValueRouteComplexity;
  readonly potential: ValueRoutePotential;
  readonly targetIndustries: readonly string[];
  readonly insight: string;
  readonly imageUrl: string;
}
