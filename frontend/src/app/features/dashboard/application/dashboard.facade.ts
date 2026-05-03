import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { DashboardSummary } from '../domain/dashboard.models';
import { DashboardHttpRepository } from '../infrastructure/dashboard-http.repository';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly repository = inject(DashboardHttpRepository);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly summary = signal<DashboardSummary | null>(null);

  readonly metrics = computed(() => this.summary()?.metrics ?? []);
  readonly volumeSeries = computed(() => this.summary()?.volumeSeries ?? []);
  readonly recentActivity = computed(() => this.summary()?.recentActivity ?? []);

  loadSummary(): void {
    this.loading.set(true);
    this.error.set(null);

    this.repository
      .getSummary()
      .pipe(
        catchError((error: unknown) => {
          this.error.set(getErrorMessage(error, 'No se pudo cargar el dashboard.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((summary) => this.summary.set(summary));
  }
}
