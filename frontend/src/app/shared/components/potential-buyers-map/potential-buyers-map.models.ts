export type BuyerScope = 'national' | 'international';

export interface PotentialBuyer {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly scope: BuyerScope;
  readonly country: string;
  readonly countryIso3?: string;
  readonly region?: string;
  readonly city?: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly match: number;
  readonly volume: string;
  readonly channel: string;
}
