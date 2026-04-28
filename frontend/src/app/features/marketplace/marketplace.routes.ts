import { Route } from '@angular/router';

export const MARKETPLACE_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./presentation/marketplace.page').then((m) => m.MarketplacePageComponent),
    data: {
      meta: {
        title: 'Marketplace',
        breadcrumb: 'Marketplace',
        icon: 'store'
      }
    }
  }
];
