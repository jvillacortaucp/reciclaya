import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PendingChangesAware } from '../../core/models/pending-changes.model';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { StepperComponent } from '../../shared/ui/stepper/stepper.component';
import { UploadDropzoneComponent } from '../../shared/ui/upload-dropzone/upload-dropzone.component';

@Component({
  selector: 'app-waste-sell-page',
  imports: [ReactiveFormsModule, SectionHeaderComponent, StepperComponent, UploadDropzoneComponent],
  templateUrl: './presentation/waste-sell.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WasteSellPageComponent implements PendingChangesAware {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    pricePerUnit: [0.5, [Validators.required, Validators.min(0.01)]],
    volume: [100, [Validators.required, Validators.min(1)]],
    unit: ['kg' as const, [Validators.required]],
    location: ['', [Validators.required]],
    pickupAvailable: [true]
  });

  hasPendingChanges(): boolean {
    return this.form.dirty;
  }

  protected saveDraft(): void {
    localStorage.setItem('waste-sell-draft', JSON.stringify(this.form.getRawValue()));
    this.form.markAsPristine();
  }

  protected publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.markAsPristine();
    window.alert('Listado registrado correctamente en modo mock.');
  }
}
