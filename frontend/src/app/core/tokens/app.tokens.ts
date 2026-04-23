import { InjectionToken } from '@angular/core';

export const APP_LATENCY_MS = new InjectionToken<number>('APP_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 450
});
