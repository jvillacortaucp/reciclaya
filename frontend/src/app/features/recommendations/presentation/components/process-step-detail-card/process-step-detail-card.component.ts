import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ManufacturingProcessStep } from '../../../models/recommendation.model';

@Component({
  selector: 'app-process-step-detail-card',
  standalone: true,
  templateUrl: './process-step-detail-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessStepDetailCardComponent {
  step = input<ManufacturingProcessStep | null>(null);
}
