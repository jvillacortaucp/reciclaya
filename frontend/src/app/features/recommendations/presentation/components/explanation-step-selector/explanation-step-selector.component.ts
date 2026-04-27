import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideArchive,
  LucideDroplets,
  LucideFactory,
  LucidePackage,
  LucideScanLine,
  LucideSearchCheck,
  LucideWind
} from '@lucide/angular';
import { ExplanationStep } from '../../../models/recommendation.model';

@Component({
  selector: 'app-explanation-step-selector',
  standalone: true,
  imports: [
    LucideSearchCheck,
    LucideDroplets,
    LucideWind,
    LucideFactory,
    LucideScanLine,
    LucidePackage,
    LucideArchive
  ],
  templateUrl: './explanation-step-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplanationStepSelectorComponent {
  steps = input.required<readonly ExplanationStep[]>();
  selectedStepId = input<string | null>(null);
  stepSelected = output<string>();

  onSelectStep(stepId: string): void {
    this.stepSelected.emit(stepId);
  }
}
