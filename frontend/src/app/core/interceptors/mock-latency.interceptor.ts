import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay } from 'rxjs';
import { APP_LATENCY_MS } from '../tokens/app.tokens';

export const mockLatencyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/mock/')) {
    return next(req);
  }

  const latency = inject(APP_LATENCY_MS);
  return next(req).pipe(delay(latency));
};
