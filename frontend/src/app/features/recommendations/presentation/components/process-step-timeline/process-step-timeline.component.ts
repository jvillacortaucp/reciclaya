import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  LucideChevronDown,
  LucideArchive,
  LucideDroplets,
  LucideFactory,
  LucidePackage,
  LucideScanLine,
  LucideSearchCheck,
  LucideWind
} from '@lucide/angular';
import { ManufacturingProcessStep } from '../../../models/recommendation.model';

@Component({
  selector: 'app-process-step-timeline',
  standalone: true,
  imports: [
    LucideSearchCheck,
    LucideChevronDown,
    LucideDroplets,
    LucideWind,
    LucideFactory,
    LucideScanLine,
    LucidePackage,
    LucideArchive
  ],
  templateUrl: './process-step-timeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessStepTimelineComponent {
  steps = input.required<readonly ManufacturingProcessStep[]>();
  selectedStepId = input<string | null>(null);
  stepSelected = output<string>();
  private readonly showAll = signal(false);

  protected readonly visibleSteps = computed(() =>
    this.showAll() ? this.steps() : this.steps().slice(0, 3)
  );

  protected readonly hasHiddenSteps = computed(() => this.steps().length > 3 && !this.showAll());

  protected readonly hiddenCount = computed(() => Math.max(this.steps().length - 3, 0));

  onSelectStep(stepId: string): void {
    this.stepSelected.emit(stepId);
  }

  showMoreSteps(): void {
    this.showAll.set(true);
  }

  protected riskTone(step: ManufacturingProcessStep): string {
    if (step.riskLevel === 'high') return 'text-rose-700 border-rose-200 bg-rose-50';
    if (step.riskLevel === 'medium') return 'text-amber-700 border-amber-200 bg-amber-50';
    return 'text-emerald-700 border-emerald-200 bg-emerald-50';
  }
}
