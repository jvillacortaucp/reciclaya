import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPageComponent),
    data: {
      meta: {
        title: 'Dashboard de impacto',
        breadcrumb: 'Dashboard de impacto',
        icon: 'layout-dashboard',
        permissions: ['view:dashboard']
      }
    }
  }
];
