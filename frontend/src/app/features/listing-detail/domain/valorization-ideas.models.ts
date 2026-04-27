export interface ValorizationIdea {
  readonly id: string | null;
  readonly title: string;
  readonly summary: string;
  readonly suggestedProduct: string;
  readonly processOverview: string;
  readonly potentialBuyers: readonly string[];
  readonly requiredConditions: readonly string[];
  readonly sellerRecommendation: string;
  readonly buyerRecommendation: string;
  readonly recommendedStrategy: string;
  readonly viabilityLevel: 'low' | 'medium' | 'high' | string;
  readonly estimatedImpact: string;
  readonly warnings: readonly string[];
  readonly source: 'deepseek' | 'fallback' | 'manual' | string;
}

export interface ValorizationIdeasState {
  readonly items: readonly ValorizationIdea[];
  readonly loading: boolean;
  readonly generating: boolean;
  readonly loaded: boolean;
}
