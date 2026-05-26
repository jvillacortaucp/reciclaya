import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComplianceLevel } from '../../../../../../core/regulatory/compliance-levels.models';
import { ComplianceStatusBadgeComponent } from '../compliance-status-badge/compliance-status-badge.component';
import { ComplianceRequirementItemComponent } from '../compliance-requirement-item/compliance-requirement-item.component';

@Component({
  selector: 'app-compliance-level-accordion',
  standalone: true,
  imports: [ComplianceStatusBadgeComponent, ComplianceRequirementItemComponent],
  templateUrl: './compliance-level-accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceLevelAccordionComponent {
  @Input({ required: true }) level!: ComplianceLevel;
  @Input() expanded = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<{ requirementId: string; file: File }>();
  @Output() removeFile = new EventEmitter<string>();

  protected toneClasses(): string {
    const classes = {
      0: 'border-slate-200 bg-slate-50/60',
      1: 'border-emerald-200 bg-emerald-50/60',
      2: 'border-cyan-200 bg-cyan-50/60',
      3: 'border-amber-200 bg-amber-50/60',
      4: 'border-rose-200 bg-rose-50/60'
    } as const;

    return classes[this.level.id];
  }

  protected levelProgressBarClasses(): string {
    const classes = {
      0: 'bg-slate-500',
      1: 'bg-emerald-500',
      2: 'bg-cyan-500',
      3: 'bg-amber-500',
      4: 'bg-rose-500'
    } as const;

    return classes[this.level.id];
  }
}
