import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { VALUE_ROUTES_MOCK } from '../data/value-routes.mock';
import { ValueRoute } from '../models/value-route.model';

@Injectable({ providedIn: 'root' })
export class ValueRoutesMockRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  listByResidue(): Observable<readonly ValueRoute[]> {
    return of(VALUE_ROUTES_MOCK).pipe(delay(this.latency));
  }
}
