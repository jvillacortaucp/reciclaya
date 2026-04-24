import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LucideImageUp, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { WasteMediaUpload } from '../../../domain/waste-sell.models';

@Component({
  selector: 'app-waste-upload-zone',
  imports: [LucideImageUp, LucidePlus, LucideTrash2],
  templateUrl: './waste-upload-zone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WasteUploadZoneComponent {
  @Input({ required: true }) mediaUploads: readonly WasteMediaUpload[] = [];
  @Input() maxFiles = 5;
  @Input() disabled = false;

  @Output() readonly filesAdded = new EventEmitter<readonly File[]>();
  @Output() readonly fileRemoved = new EventEmitter<string>();

  protected readonly dragActive = signal(false);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) {
      this.dragActive.set(true);
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);

    if (this.disabled || !event.dataTransfer?.files?.length) {
      return;
    }

    this.filesAdded.emit(Array.from(event.dataTransfer.files));
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length || this.disabled) {
      return;
    }

    this.filesAdded.emit(Array.from(files));
    input.value = '';
  }

  protected removeFile(id: string): void {
    if (!this.disabled) {
      this.fileRemoved.emit(id);
    }
  }
}
