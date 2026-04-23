import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionStorageService } from '../services/session-storage.service';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = inject(SessionStorageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        sessionStorage.clear();
      }
      return throwError(() => error);
    })
  );
};
