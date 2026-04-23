import { Route } from '@angular/router';

export const PRE_ORDERS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pre-orders.page').then((m) => m.PreOrdersPageComponent),
    data: {
      meta: {
        title: 'Pre-ordenes',
        breadcrumb: 'Pre-ordenes',
        icon: 'clipboard-list',
        permissions: ['create:preorder']
      }
    }
  },
  {
    path: 'new/:listingId',
    loadComponent: () => import('./pre-order-new.page').then((m) => m.PreOrderNewPageComponent),
    data: {
      meta: {
        title: 'Nueva pre-orden',
        breadcrumb: 'Nueva pre-orden',
        icon: 'clipboard-list',
        permissions: ['create:preorder']
      }
    }
  }
];
