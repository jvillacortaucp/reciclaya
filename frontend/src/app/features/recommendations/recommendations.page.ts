import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { Recommendation } from '../../core/models/app.models';
import { RecommendationsHttpRepository } from './recommendations-http.repository';

@Component({
  selector: 'app-recommendations-page',
  imports: [SectionHeaderComponent, CardComponent, DecimalPipe],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit {
  private readonly repository = inject(RecommendationsHttpRepository);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly recommendations = signal<readonly Recommendation[]>([]);
  protected readonly hasRecommendations = computed(() => this.recommendations().length > 0);

  ngOnInit(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudieron cargar las recomendaciones.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((items) => {
        this.recommendations.set(items);
        this.errorMessage.set(null);
      });
  }

  protected toConfidenceLabel(score: number): number {
    return score <= 1 ? score * 100 : score;
  }
}
