import { Route } from '@angular/router';

export const PROFILE_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./profile.page').then((m) => m.ProfilePageComponent),
    data: {
      meta: {
        title: 'Perfil',
        breadcrumb: 'Perfil',
        icon: 'circle-user-round',
        permissions: ['manage:profile']
      }
    }
  }
];
