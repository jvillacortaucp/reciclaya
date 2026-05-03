import { Route } from '@angular/router';

export const ORDERS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./orders.page').then((m) => m.OrdersPageComponent),
    data: {
      meta: {
        title: 'Ordenes',
        breadcrumb: 'Ordenes',
        icon: 'clipboard-list',
        roles: ['buyer', 'seller', 'admin']
      }
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail.page').then((m) => m.OrderDetailPageComponent),
    data: {
      meta: {
        title: 'Detalle de orden',
        breadcrumb: 'Detalle de orden',
        icon: 'clipboard-list',
        roles: ['buyer', 'seller', 'admin']
      }
    }
  }
];
