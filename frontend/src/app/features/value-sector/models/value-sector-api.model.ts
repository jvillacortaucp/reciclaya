export interface ValorizationIdeasResponse {
  readonly listingId: string;
  readonly residueName?: string;
  readonly ideas: readonly ValorizationIdeaDto[];
}

export interface ValorizationIdeaDto {
  readonly id: string;
  readonly routeName: string;
  readonly description: string;
  readonly marketPotential: 'low' | 'medium' | 'high' | string;
  readonly targetIndustries?: readonly string[];
  readonly products: readonly ValorizationProductDto[];
}

export interface ValorizationProductDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly complexity: 'low' | 'medium' | 'high' | string;
  readonly marketPotential: 'low' | 'medium' | 'high' | string;
  readonly potentialUse?: string;
}
