import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-upload-dropzone',
  standalone: true,
  template: `
    <label class="grid min-h-32 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-primary-500 hover:bg-primary-50">
      <input type="file" class="hidden" [multiple]="multiple" />
      <span class="text-sm text-slate-600">{{ label }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadDropzoneComponent {
  @Input() label = 'Arrastra archivos o haz clic para subir';
  @Input() multiple = true;
}
