import { Route } from '@angular/router';

export const ADMIN_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./admin.page').then((m) => m.AdminPageComponent),
    data: {
      meta: {
        title: 'Admin empresas',
        breadcrumb: 'Admin empresas',
        icon: 'settings',
        permissions: ['manage:users']
      }
    }
  }
];
