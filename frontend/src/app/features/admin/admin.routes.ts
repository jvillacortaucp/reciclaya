import { Route } from '@angular/router';

export const ADMIN_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./admin.page').then((m) => m.AdminPageComponent),
    data: {
      meta: {
        title: 'Admin',
        breadcrumb: 'Admin',
        icon: 'settings',
        permissions: ['manage:users']
      }
    }
  }
];
