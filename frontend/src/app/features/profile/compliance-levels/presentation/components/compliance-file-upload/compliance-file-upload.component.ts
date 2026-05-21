import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComplianceRequirement } from '../../../../../../core/regulatory/compliance-levels.models';

@Component({
  selector: 'app-compliance-file-upload',
  standalone: true,
  templateUrl: './compliance-file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceFileUploadComponent {
  @Input({ required: true }) requirement!: ComplianceRequirement;
  @Input() disabled = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() removeFile = new EventEmitter<void>();

  protected readonly accept = '.pdf,image/*';

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    this.fileSelected.emit(file);
  }

  protected remove(): void {
    this.removeFile.emit();
  }
}
