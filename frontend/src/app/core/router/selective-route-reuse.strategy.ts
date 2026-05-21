import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
  RouteReuseStrategy
} from '@angular/router';
import { RouteReuseCacheService } from './route-reuse-cache.service';

const DEFAULT_TTL_MS = 3 * 60 * 1000;

@Injectable()
export class SelectiveRouteReuseStrategy extends BaseRouteReuseStrategy implements RouteReuseStrategy {
  private readonly cache = inject(RouteReuseCacheService);

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && route.data?.['reuseView'] === true;
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!handle) {
      return;
    }

    const key = this.buildCacheKey(route);
    if (!key) {
      return;
    }

    this.cache.store(key, handle, this.resolveTtl(route));
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.buildCacheKey(route);
    return key ? this.cache.hasFresh(key) : false;
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.buildCacheKey(route);
    return key ? this.cache.retrieve(key) : null;
  }

  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private buildCacheKey(route: ActivatedRouteSnapshot): string | null {
    if (!route.routeConfig || route.data?.['reuseView'] !== true) {
      return null;
    }

    const explicitKey = route.data?.['reuseKey'];
    if (typeof explicitKey === 'string' && explicitKey.trim()) {
      return explicitKey.trim();
    }

    return route.routeConfig.path ?? null;
  }

  private resolveTtl(route: ActivatedRouteSnapshot): number {
    const ttl = route.data?.['cacheTtlMs'];
    return typeof ttl === 'number' && ttl > 0 ? ttl : DEFAULT_TTL_MS;
  }
}
