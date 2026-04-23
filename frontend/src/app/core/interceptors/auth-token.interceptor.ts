import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStorageService } from '../services/session-storage.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = inject(SessionStorageService);
  const session = sessionStorage.session();

  if (!session?.token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.token}`
      }
    })
  );
};
