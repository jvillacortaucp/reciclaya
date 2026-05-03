import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { APP_ROUTES } from '../constants/app.constants';
import { AuthFacade } from '../../features/auth/services/auth.facade';

export const permissionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  const meta = route.data?.['meta'] as Record<string, unknown> | undefined;
  const rawPermission = route.data?.['permission'] ?? meta?.['permission'];
  const rawPermissions = route.data?.['permissions'] ?? meta?.['permissions'];
  const rawRole = route.data?.['role'] ?? meta?.['role'];
  const rawRoles =
    route.data?.['roles'] ??
    route.data?.['allowedRoles'] ??
    meta?.['roles'] ??
    meta?.['allowedRoles'];

  const requiredPermissions = [
    ...(Array.isArray(rawPermissions) ? rawPermissions : []),
    ...(typeof rawPermission === 'string' ? [rawPermission] : [])
  ] as readonly string[];
  const requiredRoles = [
    ...(Array.isArray(rawRoles) ? rawRoles : []),
    ...(typeof rawRole === 'string' ? [rawRole] : [])
  ] as readonly string[];

  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return true;
  }

  const hasPermission = requiredPermissions.length === 0 || requiredPermissions.every((p) => authFacade.hasPermission(p));
  const hasRole = requiredRoles.length === 0 || authFacade.hasAnyRole(requiredRoles);

  return hasPermission && hasRole ? true : router.createUrlTree([APP_ROUTES.dashboard]);
};
