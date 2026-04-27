import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { DASHBOARD_IMPACT_MOCK } from '../data/dashboard-impact.mock';
import { DashboardImpactData, DashboardPeriod } from '../models/dashboard-impact.model';

@Injectable({ providedIn: 'root' })
export class DashboardImpactService {
  private readonly latency = inject(APP_LATENCY_MS);

  getImpactData(period: DashboardPeriod): Observable<DashboardImpactData> {
    return of(DASHBOARD_IMPACT_MOCK[period]).pipe(delay(this.latency));
  }
}

