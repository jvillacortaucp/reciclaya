import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RecommendationProcess, ExplanationStep, EnvironmentalSummary } from '../../../models/recommendation.model';
import { EnvironmentalFactorsCardComponent } from '../environmental-factors-card/environmental-factors-card.component';
import { EnvironmentalSummaryCardComponent } from '../environmental-summary-card/environmental-summary-card.component';
import { ExplanationDetailCardComponent } from '../explanation-detail-card/explanation-detail-card.component';
import { ExplanationStepSelectorComponent } from '../explanation-step-selector/explanation-step-selector.component';
import { NatureBenefitsGridComponent } from '../nature-benefits-grid/nature-benefits-grid.component';

@Component({
  selector: 'app-recommendation-explanation',
  standalone: true,
  imports: [
    ExplanationStepSelectorComponent,
    ExplanationDetailCardComponent,
    EnvironmentalFactorsCardComponent,
    NatureBenefitsGridComponent,
    EnvironmentalSummaryCardComponent
  ],
  templateUrl: './recommendation-explanation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationExplanationComponent {
  recommendation = input.required<RecommendationProcess>();
  selectedStep = input<ExplanationStep | null>(null);
  selectedStepId = input<string | null>(null);
  environmentalSummary = input<EnvironmentalSummary | null>(null);
  stepSelected = output<string>();

  onStepSelected(stepId: string): void {
    this.stepSelected.emit(stepId);
  }
}
