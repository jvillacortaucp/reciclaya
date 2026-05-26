import { Injectable } from '@angular/core';

export type GeoBoundaryAdminLevel = 'ADM0' | 'ADM1' | 'ADM2' | 'ADM3';

@Injectable({
  providedIn: 'root'
})
export class GeoBoundaryService {
  private readonly cache = new Map<string, unknown | null>();

  async getGeoBoundary(iso3: string, admLevel: GeoBoundaryAdminLevel): Promise<unknown | null> {
    const key = `${iso3}-${admLevel}`;
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    const metadataUrl = `https://www.geoboundaries.org/api/current/gbOpen/${iso3}/${admLevel}/`;

    try {
      const metadataResponse = await fetch(metadataUrl);
      if (!metadataResponse.ok) {
        console.warn('[GeoBoundaryService] Metadata request failed', metadataUrl, metadataResponse.status);
        this.cache.set(key, null);
        return null;
      }

      const metadata = (await metadataResponse.json()) as {
        simplifiedGeometryGeoJSON?: string;
        gjDownloadURL?: string;
      };

      const geojsonUrl = metadata.simplifiedGeometryGeoJSON || metadata.gjDownloadURL;
      if (!geojsonUrl) {
        console.warn('[GeoBoundaryService] Missing GeoJSON URL in metadata', metadataUrl, metadata);
        this.cache.set(key, null);
        return null;
      }

      const geoJsonResponse = await fetch(geojsonUrl);
      if (!geoJsonResponse.ok) {
        console.warn('[GeoBoundaryService] GeoJSON request failed', geojsonUrl, geoJsonResponse.status);
        this.cache.set(key, null);
        return null;
      }

      const geoJson = (await geoJsonResponse.json()) as unknown;
      this.cache.set(key, geoJson);
      return geoJson;
    } catch (error) {
      console.warn('[GeoBoundaryService] Failed to load boundary', { iso3, admLevel, error });
      this.cache.set(key, null);
      return null;
    }
  }
}

