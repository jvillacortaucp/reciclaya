import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPageComponent),
    data: {
      meta: {
        title: 'Dashboard',
        breadcrumb: 'Dashboard',
        icon: 'layout-dashboard',
        permissions: ['view:dashboard']
      }
    }
  }
];
