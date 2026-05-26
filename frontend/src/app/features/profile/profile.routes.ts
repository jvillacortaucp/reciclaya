import { Route } from '@angular/router';

export const PROFILE_ROUTES: Route[] = [
  {
    path: 'compliance-levels',
    loadComponent: () =>
      import('./compliance-levels/compliance-levels.page').then((m) => m.ComplianceLevelsPageComponent),
    data: {
      meta: {
        title: 'Regularización y cumplimiento',
        breadcrumb: 'Cumplimiento',
        icon: 'shield-check',
        permissions: ['manage:profile']
      }
    }
  },
  {
    path: '',
    loadComponent: () => import('./profile.page').then((m) => m.ProfilePageComponent),
    data: {
      reuseView: true,
      reuseKey: 'profile',
      cacheTtlMs: 180000,
      meta: {
        title: 'Perfil',
        breadcrumb: 'Perfil',
        icon: 'circle-user-round',
        permissions: ['manage:profile']
      }
    }
  }
];
