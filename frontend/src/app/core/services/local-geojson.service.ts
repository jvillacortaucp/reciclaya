import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalGeoJsonService {
  private readonly cache = new Map<string, unknown>();

  async getPeruAdm1GeoJson(): Promise<unknown | null> {
    return this.fetchWithFallback(
      'peru-adm1',
      [
        '/assets/maps/geoBoundaries-PER-ADM1_simplified.geojson',
        '/assets/maps/geoBoundaries-PER-ADM1.geojson',
        '/assets/maps/peru-adm1.geojson'
      ]
    );
  }

  async getCountriesGeoJson(): Promise<unknown | null> {
    return this.fetchWithFallback('countries', ['/assets/maps/countries.geojson']);
  }

  private async fetchWithFallback(cacheKey: string, urls: readonly string[]): Promise<unknown | null> {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[LocalGeoJsonService] No se pudo cargar ${url}: ${response.status}`);
          continue;
        }

        const geoJson = (await response.json()) as unknown;
        this.cache.set(cacheKey, geoJson);
        return geoJson;
      } catch (error) {
        console.warn(`[LocalGeoJsonService] Error al cargar ${url}`, error);
      }
    }

    return null;
  }
}
