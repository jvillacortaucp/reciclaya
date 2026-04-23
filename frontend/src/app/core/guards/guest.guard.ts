import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { APP_ROUTES } from '../constants/app.constants';
import { AuthFacade } from '../../features/auth/services/auth.facade';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  return authFacade.isAuthenticated() ? router.createUrlTree([APP_ROUTES.dashboard]) : true;
};
