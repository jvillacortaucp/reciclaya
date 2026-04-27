import { delay, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { Recommendation } from '../../core/models/app.models';
import { APP_LATENCY_MS } from '../../core/tokens/app.tokens';
import { RECOMMENDATIONS_MOCK } from '../../../assets/mocks/marketplace.mock';

@Injectable({ providedIn: 'root' })
export class RecommendationsMockRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  list(): Observable<readonly Recommendation[]> {
    return of(RECOMMENDATIONS_MOCK).pipe(delay(this.latency));
  }
}
