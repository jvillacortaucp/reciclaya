import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { BuyerScope, PotentialBuyer } from './potential-buyers-map.models';

const REGION_NAME_KEYS = [
  'shapeName',
  'shapeISO',
  'shapeID',
  'shapeGroup',
  'shapeType',
  'NAME_1',
  'NOMBDEP',
  'DEPARTAMEN',
  'departamento',
  'region',
  'name'
] as const;
const COUNTRY_NAME_KEYS = [
  'ADMIN',
  'NAME',
  'NAME_EN',
  'NAME_ES',
  'NAME_LONG',
  'SOVEREIGNT',
  'shapeName',
  'admin',
  'country',
  'Country',
  'name'
] as const;
const COUNTRY_ISO_KEYS = ['ISO_A3', 'ADM0_A3', 'GU_A3', 'SU_A3', 'BRK_A3'] as const;
const REGION_NAME_ALIASES: Readonly<Record<string, readonly string[]>> = {
  lima: ['lima'],
  'lima metropolitana': ['lima metropolitana', 'municipalidad metropolitana de lima'],
  'municipalidad metropolitana de lima': ['lima metropolitana', 'municipalidad metropolitana de lima'],
  lambayeque: ['lambayeque']
};
const COUNTRY_NAME_ALIASES: Readonly<Record<string, readonly string[]>> = {
  'estados unidos': ['estados unidos', 'united states', 'united states of america', 'usa', 'eeuu'],
  'united states': ['estados unidos', 'united states', 'united states of america', 'usa', 'eeuu'],
  'united states of america': ['estados unidos', 'united states', 'united states of america', 'usa', 'eeuu'],
  usa: ['estados unidos', 'united states', 'united states of america', 'usa', 'eeuu'],
  eeuu: ['estados unidos', 'united states', 'united states of america', 'usa', 'eeuu'],
  brasil: ['brasil', 'brazil'],
  brazil: ['brasil', 'brazil'],
  mexico: ['mexico']
};

export function normalizeGeoName(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function escapeHtml(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildBuyerTooltipMarkup(buyer: PotentialBuyer): string {
  const location = [buyer.city, buyer.region, buyer.country].filter(Boolean).join(', ');

  return `
    <div class="potential-buyers-map__tooltip-card">
      <span class="potential-buyers-map__tooltip-eyebrow">Comprador potencial</span>
      <div class="potential-buyers-map__tooltip-header">
        <p class="potential-buyers-map__tooltip-title">${escapeHtml(buyer.name)}</p>
        <span class="potential-buyers-map__tooltip-match">${buyer.match}%</span>
      </div>
      <p class="potential-buyers-map__tooltip-type">${escapeHtml(buyer.type)}</p>
      <div class="potential-buyers-map__tooltip-grid">
        <div class="potential-buyers-map__tooltip-metric">
          <span class="potential-buyers-map__tooltip-label">Volumen</span>
          <strong class="potential-buyers-map__tooltip-value">${escapeHtml(buyer.volume)}</strong>
        </div>
        <div class="potential-buyers-map__tooltip-metric">
          <span class="potential-buyers-map__tooltip-label">Canal</span>
          <strong class="potential-buyers-map__tooltip-value">${escapeHtml(buyer.channel)}</strong>
        </div>
      </div>
      <div class="potential-buyers-map__tooltip-location-block">
        <span class="potential-buyers-map__tooltip-label">Ubicación</span>
        <p class="potential-buyers-map__tooltip-location">${escapeHtml(location)}</p>
      </div>
    </div>
  `;
}

export function getFeatureLabel(
  feature: Feature<Geometry>,
  scope: BuyerScope
): string | null {
  const keys = scope === 'national' ? REGION_NAME_KEYS : COUNTRY_NAME_KEYS;

  for (const key of keys) {
    const value = feature.get(key);
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

export function getFeatureCountryIso3(feature: Feature<Geometry>): string | null {
  for (const key of COUNTRY_ISO_KEYS) {
    const value = feature.get(key);
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

export function findMatchingFeature(
  features: readonly Feature<Geometry>[],
  scope: BuyerScope,
  targetName: string | null | undefined
): Feature<Geometry> | null {
  const normalizedTarget = normalizeGeoName(targetName);
  if (!normalizedTarget) {
    return null;
  }

  return (
    features.find((feature) => normalizeGeoName(getFeatureLabel(feature, scope)) === normalizedTarget) ?? null
  );
}

export function findMatchingFeatures(
  features: readonly Feature<Geometry>[],
  scope: BuyerScope,
  targetNames: readonly (string | null | undefined)[]
): readonly Feature<Geometry>[] {
  const normalizedTargets =
    scope === 'national'
      ? expandRegionNames(targetNames)
      : new Set(targetNames.map((targetName) => normalizeGeoName(targetName)).filter((targetName) => !!targetName));

  if (!normalizedTargets.size) {
    return [];
  }

  return features.filter((feature) => {
    const featureLabel = normalizeGeoName(getFeatureLabel(feature, scope));
    return !!featureLabel && normalizedTargets.has(featureLabel);
  });
}

function expandRegionNames(regionNames: readonly (string | null | undefined)[]): Set<string> {
  const expanded = new Set<string>();

  for (const regionName of regionNames) {
    const normalized = normalizeGeoName(regionName);
    if (!normalized) {
      continue;
    }

    expanded.add(normalized);
    for (const alias of REGION_NAME_ALIASES[normalized] ?? []) {
      expanded.add(normalizeGeoName(alias));
    }
  }

  return expanded;
}

function expandCountryNames(countryNames: readonly (string | null | undefined)[]): Set<string> {
  const expanded = new Set<string>();

  for (const countryName of countryNames) {
    const normalized = normalizeGeoName(countryName);
    if (!normalized) {
      continue;
    }

    expanded.add(normalized);
    for (const alias of COUNTRY_NAME_ALIASES[normalized] ?? []) {
      expanded.add(normalizeGeoName(alias));
    }
  }

  return expanded;
}

export function findMatchingCountryFeature(
  features: readonly Feature<Geometry>[],
  countryName: string | null | undefined,
  countryIso3: string | null | undefined
): Feature<Geometry> | null {
  const normalizedIso = normalizeGeoName(countryIso3);
  if (normalizedIso) {
    const matchedByIso =
      features.find((feature) => normalizeGeoName(getFeatureCountryIso3(feature)) === normalizedIso) ?? null;
    if (matchedByIso) {
      return matchedByIso;
    }
  }

  return findMatchingFeature(features, 'international', countryName);
}

export function findMatchingCountryFeatures(
  features: readonly Feature<Geometry>[],
  countryNames: readonly (string | null | undefined)[],
  countryIso3s: readonly (string | null | undefined)[]
): readonly Feature<Geometry>[] {
  const normalizedIsoSet = new Set(
    countryIso3s.map((countryIso3) => normalizeGeoName(countryIso3)).filter((countryIso3) => !!countryIso3)
  );
  const normalizedCountrySet = expandCountryNames(countryNames);

  if (!normalizedIsoSet.size && !normalizedCountrySet.size) {
    return [];
  }

  return features.filter((feature) => {
    const featureIso = normalizeGeoName(getFeatureCountryIso3(feature));
    if (featureIso && normalizedIsoSet.has(featureIso)) {
      return true;
    }

    const featureLabel = normalizeGeoName(getFeatureLabel(feature, 'international'));
    return !!featureLabel && normalizedCountrySet.has(featureLabel);
  });
}

export function matchesBuyerFocus(
  buyer: PotentialBuyer,
  scope: BuyerScope,
  focusName: string | null | undefined
): boolean {
  const normalizedFocus = normalizeGeoName(focusName);
  if (!normalizedFocus) {
    return true;
  }

  const candidate = scope === 'national' ? buyer.region : buyer.country;
  return normalizeGeoName(candidate) === normalizedFocus;
}

export function resolveFocusBuyer(
  buyers: readonly PotentialBuyer[],
  scope: BuyerScope,
  regionOverride: string | null | undefined,
  countryIso3Override: string | null | undefined
): PotentialBuyer | null {
  if (!buyers.length) {
    return null;
  }

  const sorted = [...buyers].sort((left, right) => right.match - left.match);

  if (scope === 'national') {
    const normalizedRegion = normalizeGeoName(regionOverride);
    if (normalizedRegion) {
      return (
        sorted.find((buyer) => normalizeGeoName(buyer.region) === normalizedRegion) ??
        sorted.find((buyer) => !!buyer.region) ??
        sorted[0]
      );
    }

    return sorted.find((buyer) => !!buyer.region) ?? sorted[0];
  }

  const normalizedIso = normalizeGeoName(countryIso3Override);
  if (normalizedIso) {
    return (
      sorted.find((buyer) => normalizeGeoName(buyer.countryIso3) === normalizedIso) ??
      sorted.find((buyer) => !!buyer.countryIso3) ??
      sorted[0]
    );
  }

  return sorted.find((buyer) => !!buyer.countryIso3) ?? sorted[0];
}
