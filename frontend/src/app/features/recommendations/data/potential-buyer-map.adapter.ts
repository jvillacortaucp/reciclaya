import { PotentialBuyer } from 'app/shared/components/potential-buyers-map/potential-buyers-map.models';
import { BuyerSegment } from '../models/recommendation.model';
import { findStaticBuyerLocation } from './potential-buyer-locations.constants';

export function adaptBuyerSegmentsToPotentialBuyers(
  buyers: readonly BuyerSegment[]
): readonly PotentialBuyer[] {
  return buyers.flatMap((buyer) => {
    const location = findStaticBuyerLocation(buyer.id, buyer.name, buyer.region, buyer.country);
    if (!location) {
      console.warn('[PotentialBuyersMap] Missing static coordinates for buyer', buyer);
      return [];
    }

    return [
      {
        id: buyer.id,
        name: buyer.name,
        type: buyer.segment,
        scope: buyer.scope === 'nacional' ? 'national' : 'international',
        country: location.country ?? buyer.country ?? 'Perú',
        countryIso3: location.countryIso3,
        region: location.region ?? buyer.region,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        match: buyer.probability,
        volume: buyer.monthlyVolume,
        channel: buyer.channel
      }
    ];
  });
}
