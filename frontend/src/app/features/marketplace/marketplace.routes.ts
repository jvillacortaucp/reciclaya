import { Route } from '@angular/router';

export const MARKETPLACE_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./presentation/marketplace.page').then((m) => m.MarketplacePageComponent),
    data: {
      reuseView: true,
      reuseKey: 'marketplace',
      cacheTtlMs: 180000,
      meta: {
        title: 'Marketplace',
        breadcrumb: 'Marketplace',
        icon: 'store'
      }
    }
  }
];
