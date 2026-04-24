import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { RECOMMENDATION_PROCESS_MOCK } from '../data/recommendation-process.mock';
import { RecommendationProcess } from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private readonly latency = inject(APP_LATENCY_MS);

  getProcessRecommendation(): Observable<RecommendationProcess> {
    return of(RECOMMENDATION_PROCESS_MOCK).pipe(delay(this.latency));
  }
}
