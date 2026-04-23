import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { Recommendation } from '../../core/models/app.models';
import { RecommendationsService } from './recommendations.service';

@Component({
  selector: 'app-recommendations-page',
  imports: [SectionHeaderComponent, CardComponent, DecimalPipe],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit {
  private readonly service = inject(RecommendationsService);

  protected readonly loading = signal(false);
  protected readonly recommendations = signal<readonly Recommendation[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe((items) => {
      this.recommendations.set(items);
      this.loading.set(false);
    });
  }
}
