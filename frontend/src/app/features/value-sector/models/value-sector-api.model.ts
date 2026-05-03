export type ValorizationIdeaStrategy =
  | 'sell_as_is'
  | 'partner_with_processor'
  | 'buy_to_transform'
  | string;

export type ValorizationIdeaViability =
  | 'low'
  | 'medium'
  | 'high'
  | string;

export interface ValorizationIdeaApiItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly suggestedProduct: string;
  readonly processOverview?: string | null;
  readonly potentialBuyers?: readonly string[] | null;
  readonly requiredConditions?: readonly string[] | null;
  readonly sellerRecommendation?: string | null;
  readonly buyerRecommendation?: string | null;
  readonly recommendedStrategy?: ValorizationIdeaStrategy | null;
  readonly viabilityLevel?: ValorizationIdeaViability | null;
  readonly estimatedImpact?: string | null;
  readonly warnings?: readonly string[] | null;
  readonly source?: 'deepseek' | 'fallback' | 'manual' | string | null;
}

export type ValorizationIdeasResponse = readonly ValorizationIdeaApiItem[];
