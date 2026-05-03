import { Route } from '@angular/router';

export const MY_LISTINGS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/my-listings.page').then((m) => m.MyListingsPageComponent),
    data: {
      meta: {
        title: 'Mis solicitudes',
        breadcrumb: 'Mis solicitudes',
        icon: 'store',
        permissions: ['view:my-listings']
      }
    }
  }
];
