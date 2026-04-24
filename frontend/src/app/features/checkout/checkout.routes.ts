import { Route } from '@angular/router';

export const CHECKOUT_ROUTES: Route[] = [
  {
    path: ':listingId',
    loadComponent: () => import('./checkout.page').then((m) => m.CheckoutPageComponent),
    data: {
      meta: {
        title: 'Checkout',
        breadcrumb: 'Checkout',
        icon: 'clipboard-list',
        roles: ['buyer', 'admin']
      }
    }
  }
];
