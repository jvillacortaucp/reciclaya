import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComplianceRequirement } from '../../../../../../core/regulatory/compliance-levels.models';
import { ComplianceStatusBadgeComponent } from '../compliance-status-badge/compliance-status-badge.component';
import { ComplianceFileUploadComponent } from '../compliance-file-upload/compliance-file-upload.component';

@Component({
  selector: 'app-compliance-requirement-item',
  standalone: true,
  imports: [ComplianceStatusBadgeComponent, ComplianceFileUploadComponent],
  templateUrl: './compliance-requirement-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceRequirementItemComponent {
  @Input({ required: true }) requirement!: ComplianceRequirement;
  @Input() disabled = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() removeFile = new EventEmitter<void>();

  protected readonly actorLabels = {
    seller: 'Vendedor',
    buyer: 'Comprador',
    both: 'Ambos'
  } as const;
}
