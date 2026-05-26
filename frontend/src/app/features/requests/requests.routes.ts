import { Route } from '@angular/router';

export const REQUESTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./requests.page').then((m) => m.RequestsPageComponent),
    data: {
      reuseView: true,
      reuseKey: 'requests',
      cacheTtlMs: 180000,
      meta: {
        title: 'Solicitudes',
        breadcrumb: 'Solicitudes',
        icon: 'clipboard-list',
        permissions: ['view:requests']
      }
    }
  }
];
