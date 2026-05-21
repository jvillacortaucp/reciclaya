import { Route } from '@angular/router';

export const MY_LISTINGS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/my-listings.page').then((m) => m.MyListingsPageComponent),
    data: {
      reuseView: true,
      reuseKey: 'my-listings',
      cacheTtlMs: 180000,
      meta: {
        title: 'Mis solicitudes',
        breadcrumb: 'Mis solicitudes',
        icon: 'store',
        permissions: ['view:my-listings']
      }
    }
  }
];
