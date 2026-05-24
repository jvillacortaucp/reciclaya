import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalGeoJsonService {
  private readonly cache = new Map<string, unknown>();
  private readonly baseUri = typeof document !== 'undefined' ? document.baseURI : '/';

  async getPeruAdm1GeoJson(): Promise<unknown | null> {
    return this.fetchWithFallback(
      'peru-adm1',
      [
        'assets/maps/geoBoundaries-PER-ADM1_simplified.geojson',
        'assets/maps/geoBoundaries-PER-ADM1.geojson',
        'assets/maps/peru-adm1.geojson'
      ]
    );
  }

  async getCountriesGeoJson(): Promise<unknown | null> {
    return this.fetchWithFallback('countries', ['assets/maps/countries.geojson']);
  }

  private async fetchWithFallback(cacheKey: string, assetPaths: readonly string[]): Promise<unknown | null> {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const attemptedUrls: string[] = [];
    let lastError: unknown = null;

    for (const assetPath of assetPaths) {
      for (const url of this.resolveAssetUrls(assetPath)) {
        attemptedUrls.push(url);

        try {
          const response = await fetch(url);
          if (!response.ok) {
            lastError = `HTTP_${response.status}`;
            console.warn(`[LocalGeoJsonService] No se pudo cargar ${url}: ${response.status}`);
            continue;
          }

          const geoJson = (await response.json()) as unknown;
          this.cache.set(cacheKey, geoJson);
          return geoJson;
        } catch (error) {
          lastError = error;
          console.warn(`[LocalGeoJsonService] Error al cargar ${url}`, error);
        }
      }
    }

    console.warn('[LocalGeoJsonService] Agotadas las rutas de assets GeoJSON', {
      cacheKey,
      baseURI: this.baseUri,
      attemptedUrls,
      error: this.describeError(lastError)
    });

    return null;
  }

  private resolveAssetUrls(assetPath: string): readonly string[] {
    const candidates = new Set<string>();

    try {
      candidates.add(new URL(assetPath, this.baseUri).toString());
    } catch {
      // Ignorado; seguimos con fallbacks simples.
    }

    candidates.add(assetPath);

    if (typeof window !== 'undefined' && window.location?.origin) {
      try {
        candidates.add(new URL(assetPath, `${window.location.origin}/`).toString());
      } catch {
        // Ignorado; seguimos con los candidatos restantes.
      }
    }

    return [...candidates];
  }

  private describeError(error: unknown): string {
    if (!error) {
      return 'UNKNOWN';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'UNKNOWN';
  }
}
