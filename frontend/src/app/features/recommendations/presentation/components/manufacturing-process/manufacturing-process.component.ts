import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RecommendationProcess } from '../../../models/recommendation.model';
import { ProcessStepTimelineComponent } from '../process-step-timeline/process-step-timeline.component';

@Component({
  selector: 'app-manufacturing-process',
  standalone: true,
  imports: [ProcessStepTimelineComponent],
  templateUrl: './manufacturing-process.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManufacturingProcessComponent {
  recommendation = input<RecommendationProcess | null>(null);
  selectedStepId = input<string | null>(null);
  stepSelected = output<string>();

  onStepSelected(stepId: string): void {
    this.stepSelected.emit(stepId);
  }
}
