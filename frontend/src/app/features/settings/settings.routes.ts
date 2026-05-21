import { Route } from '@angular/router';

export const SETTINGS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./settings.page').then((m) => m.SettingsPageComponent),
    data: {
      reuseView: true,
      reuseKey: 'settings',
      cacheTtlMs: 180000,
      meta: {
        title: 'Ajustes',
        breadcrumb: 'Ajustes',
        icon: 'settings',
        permissions: ['manage:profile']
      }
    }
  }
];
