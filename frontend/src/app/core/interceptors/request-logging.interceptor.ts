import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const requestLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production) {
    return next(req);
  }

  const start = performance.now();
  return next(req).pipe(
    tap({
      next: () => {
        const elapsed = (performance.now() - start).toFixed(1);
        console.info(`[HTTP] ${req.method} ${req.urlWithParams} in ${elapsed}ms`);
      }
    })
  );
};
