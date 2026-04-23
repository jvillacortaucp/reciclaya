import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { APP_ROUTES } from '../constants/app.constants';
import { AuthFacade } from '../../features/auth/services/auth.facade';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  const requiredPermissions = (route.data?.['meta']?.permissions ?? []) as readonly string[];
  const requiredRoles = (route.data?.['meta']?.roles ?? []) as readonly string[];

  const hasPermission = requiredPermissions.length === 0 || requiredPermissions.every((p) => authFacade.hasPermission(p));
  const hasRole = requiredRoles.length === 0 || authFacade.hasAnyRole(requiredRoles);

  return hasPermission && hasRole ? true : router.createUrlTree([APP_ROUTES.dashboard]);
};
