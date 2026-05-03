import { Route } from '@angular/router';
import { guestGuard } from '../../../core/guards/guest.guard';
import { AuthLayoutComponent } from '../../../core/layouts/auth-layout/auth-layout.component';

export const AUTH_ROUTES: Route[] = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('../login/login.page').then((m) => m.LoginPageComponent),
        data: { meta: { title: 'Iniciar sesion', breadcrumb: 'Login', icon: 'circle-user-round' } }
      },
      {
        path: 'register',
        loadComponent: () => import('../register/register.page').then((m) => m.RegisterPageComponent),
        data: { meta: { title: 'Registro', breadcrumb: 'Registro', icon: 'badge-check' } }
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  }
];
