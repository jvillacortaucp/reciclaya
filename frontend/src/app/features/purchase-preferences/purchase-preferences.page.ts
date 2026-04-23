import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { PurchasePreference } from '../../core/models/app.models';
import { PendingChangesAware } from '../../core/models/pending-changes.model';
import { PurchasePreferencesFacade } from './application/purchase-preferences.facade';

@Component({
  selector: 'app-purchase-preferences-page',
  imports: [ReactiveFormsModule, SectionHeaderComponent, CardComponent],
  templateUrl: './presentation/purchase-preferences.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchasePreferencesPageComponent implements OnInit, PendingChangesAware {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(PurchasePreferencesFacade);

  protected readonly preferences = this.facade.preferences;
  protected readonly loading = this.facade.loading;

  protected readonly form = this.fb.nonNullable.group({
    material: ['', [Validators.required]],
    monthlyDemand: [500, [Validators.required, Validators.min(1)]],
    unit: ['kg' as const, [Validators.required]],
    maxBudget: [1000, [Validators.required, Validators.min(1)]],
    location: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.facade.load();
  }

  hasPendingChanges(): boolean {
    return this.form.dirty;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const preference: PurchasePreference = {
      id: `pref-${Date.now()}`,
      material: value.material,
      monthlyDemand: { amount: value.monthlyDemand, unit: value.unit },
      maxBudget: value.maxBudget,
      location: value.location
    };

    this.facade.create(preference);
    this.form.markAsPristine();
    this.form.reset({ material: '', monthlyDemand: 500, unit: 'kg', maxBudget: 1000, location: '' });
  }
}
