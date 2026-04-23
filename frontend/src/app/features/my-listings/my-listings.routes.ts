import { Route } from '@angular/router';

export const MY_LISTINGS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./my-listings.page').then((m) => m.MyListingsPageComponent),
    data: {
      meta: {
        title: 'Mis publicaciones',
        breadcrumb: 'Mis publicaciones',
        icon: 'store',
        permissions: ['view:my-listings']
      }
    }
  }
];
