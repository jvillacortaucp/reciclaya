import { Route } from '@angular/router';

export const LISTING_DETAIL_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./listing-detail.page').then((m) => m.ListingDetailPageComponent),
    data: {
      meta: {
        title: 'Detalle de listado',
        breadcrumb: 'Detalle',
        icon: 'store',
        permissions: ['view:marketplace']
      }
    }
  }
];
