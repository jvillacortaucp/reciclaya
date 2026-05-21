import { normalizeGeoName } from 'app/shared/components/potential-buyers-map/potential-buyers-map.utils';

export interface PotentialBuyerLocationSeed {
  readonly buyerId?: string;
  readonly buyerName?: string;
  readonly city: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly region?: string;
  readonly country: string;
  readonly countryIso3: string;
}

export const POTENTIAL_BUYER_LOCATION_SEEDS: readonly PotentialBuyerLocationSeed[] = [
  {
    buyerName: 'Vivero El Agricultor',
    city: 'Chiclayo',
    latitude: -6.7714,
    longitude: -79.8409,
    region: 'Lambayeque',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'Ecofibras Naturales S.A.C.',
    city: 'Chiclayo',
    latitude: -6.7714,
    longitude: -79.8409,
    region: 'Lambayeque',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'Natural Beauty Perú',
    city: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    region: 'Lima',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'BioNatural Perú S.A.C.',
    city: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    region: 'Lima Metropolitana',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'Bioinsumos Andinos',
    city: 'Huancayo',
    latitude: -12.0651,
    longitude: -75.2049,
    region: 'Junín',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'Agrocompost Norte',
    city: 'Trujillo',
    latitude: -8.1116,
    longitude: -79.0287,
    region: 'La Libertad',
    country: 'Perú',
    countryIso3: 'PER'
  },
  {
    buyerName: 'Terra Verde Health & Beauty, LLC',
    city: 'Miami',
    latitude: 25.7617,
    longitude: -80.1918,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  },
  {
    buyerName: 'EcoAndes Import & Export',
    city: 'Miami',
    latitude: 25.7617,
    longitude: -80.1918,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  },
  {
    buyerName: 'Green Inputs Colombia',
    city: 'Bogotá',
    latitude: 4.711,
    longitude: -74.0721,
    country: 'Colombia',
    countryIso3: 'COL'
  },
  {
    buyerName: 'Eco Agro Chile',
    city: 'Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    country: 'Chile',
    countryIso3: 'CHL'
  },
  {
    buyerName: 'Valora Brasil',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    country: 'Brasil',
    countryIso3: 'BRA'
  }
];

export const PERU_REGION_CENTROIDS: Readonly<Record<string, PotentialBuyerLocationSeed>> = {
  lambayeque: {
    city: 'Chiclayo',
    latitude: -6.7714,
    longitude: -79.8409,
    region: 'Lambayeque',
    country: 'Perú',
    countryIso3: 'PER'
  },
  lima: {
    city: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    region: 'Lima',
    country: 'Perú',
    countryIso3: 'PER'
  },
  'lima metropolitana': {
    city: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    region: 'Lima Metropolitana',
    country: 'Perú',
    countryIso3: 'PER'
  },
  arequipa: {
    city: 'Arequipa',
    latitude: -16.409,
    longitude: -71.5375,
    region: 'Arequipa',
    country: 'Perú',
    countryIso3: 'PER'
  },
  'la libertad': {
    city: 'Trujillo',
    latitude: -8.1116,
    longitude: -79.0287,
    region: 'La Libertad',
    country: 'Perú',
    countryIso3: 'PER'
  },
  piura: {
    city: 'Piura',
    latitude: -5.1945,
    longitude: -80.6328,
    region: 'Piura',
    country: 'Perú',
    countryIso3: 'PER'
  },
  cusco: {
    city: 'Cusco',
    latitude: -13.53195,
    longitude: -71.96746,
    region: 'Cusco',
    country: 'Perú',
    countryIso3: 'PER'
  },
  junin: {
    city: 'Huancayo',
    latitude: -12.0651,
    longitude: -75.2049,
    region: 'Junín',
    country: 'Perú',
    countryIso3: 'PER'
  },
  ica: {
    city: 'Ica',
    latitude: -14.0678,
    longitude: -75.7286,
    region: 'Ica',
    country: 'Perú',
    countryIso3: 'PER'
  }
};

export const COUNTRY_CENTROIDS: Readonly<Record<string, PotentialBuyerLocationSeed>> = {
  peru: {
    city: 'Lima',
    latitude: -12.0464,
    longitude: -77.0428,
    country: 'Perú',
    countryIso3: 'PER'
  },
  colombia: {
    city: 'Bogotá',
    latitude: 4.711,
    longitude: -74.0721,
    country: 'Colombia',
    countryIso3: 'COL'
  },
  ecuador: {
    city: 'Quito',
    latitude: -0.1807,
    longitude: -78.4678,
    country: 'Ecuador',
    countryIso3: 'ECU'
  },
  chile: {
    city: 'Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    country: 'Chile',
    countryIso3: 'CHL'
  },
  brasil: {
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    country: 'Brasil',
    countryIso3: 'BRA'
  },
  brazil: {
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    country: 'Brasil',
    countryIso3: 'BRA'
  },
  mexico: {
    city: 'Ciudad de México',
    latitude: 19.4326,
    longitude: -99.1332,
    country: 'México',
    countryIso3: 'MEX'
  },
  'estados unidos': {
    city: 'Washington D.C.',
    latitude: 38.9072,
    longitude: -77.0369,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  },
  'united states': {
    city: 'Washington D.C.',
    latitude: 38.9072,
    longitude: -77.0369,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  },
  'united states of america': {
    city: 'Washington D.C.',
    latitude: 38.9072,
    longitude: -77.0369,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  },
  usa: {
    city: 'Washington D.C.',
    latitude: 38.9072,
    longitude: -77.0369,
    country: 'Estados Unidos',
    countryIso3: 'USA'
  }
};

export function findStaticBuyerLocation(
  buyerId: string,
  buyerName: string,
  region: string | undefined,
  country: string | undefined
): PotentialBuyerLocationSeed | null {
  const normalizedId = normalizeGeoName(buyerId);
  const normalizedName = normalizeGeoName(buyerName);
  const normalizedRegion = normalizeGeoName(region);
  const normalizedCountry = normalizeGeoName(country);

  const explicit =
    POTENTIAL_BUYER_LOCATION_SEEDS.find((seed) => normalizeGeoName(seed.buyerId) === normalizedId) ??
    POTENTIAL_BUYER_LOCATION_SEEDS.find((seed) => normalizeGeoName(seed.buyerName) === normalizedName) ??
    POTENTIAL_BUYER_LOCATION_SEEDS.find((seed) => {
      const seedName = normalizeGeoName(seed.buyerName);
      return !!seedName && (!!normalizedName && (normalizedName.includes(seedName) || seedName.includes(normalizedName)));
    });

  if (explicit) {
    return explicit;
  }

  if (normalizedRegion && PERU_REGION_CENTROIDS[normalizedRegion]) {
    return PERU_REGION_CENTROIDS[normalizedRegion];
  }

  if (normalizedCountry && COUNTRY_CENTROIDS[normalizedCountry]) {
    return COUNTRY_CENTROIDS[normalizedCountry];
  }

  return null;
}
