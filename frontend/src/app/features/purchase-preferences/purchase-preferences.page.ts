import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  LucideBell,
  LucideCircleDollarSign,
  LucideEye,
  LucideInfo,
  // LucideLoaderCircle,
  LucideMapPin,
  LucidePackagePlus,
  // LucideSave,
  LucideTruck
} from '@lucide/angular';
import { PendingChangesAware } from '../../core/models/pending-changes.model';
import { PurchasePreferencesFacade } from './application/purchase-preferences.facade';
import {
  ACCEPTED_EXCHANGE_OPTIONS,
  CONDITION_OPTIONS,
  PRIORITY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  PURCHASE_FREQUENCY_OPTIONS,
  PURCHASE_PREFERENCES_COPY,
  PURCHASE_PREFERENCES_MESSAGES,
  SPECIFIC_RESIDUE_OPTIONS,
  PREFERRED_MODE_OPTIONS,
  RADIUS_RANGE,
  RESIDUE_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  UNIT_OPTIONS
} from './data/purchase-preferences.constants';
import { MaterialCondition, PurchasePreferencesPageState } from './domain/purchase-preferences.models';
import { ResidueTypeToggleComponent } from './presentation/components/residue-type-toggle/residue-type-toggle.component';
import { ConditionChipGroupComponent } from './presentation/components/condition-chip-group/condition-chip-group.component';
import { RangeSliderFieldComponent } from './presentation/components/range-slider-field/range-slider-field.component';
import { ProfileStatusCardComponent } from './presentation/components/profile-status-card/profile-status-card.component';
import { ActiveSummaryCardComponent } from './presentation/components/active-summary-card/active-summary-card.component';

@Component({
  selector: 'app-purchase-preferences-page',
  imports: [
    ReactiveFormsModule,
    ResidueTypeToggleComponent,
    ConditionChipGroupComponent,
    RangeSliderFieldComponent,
    ProfileStatusCardComponent,
    ActiveSummaryCardComponent,
    LucideEye,
    // LucideSave,
    LucideBell,
    LucideInfo,
    LucideCircleDollarSign,
    LucideTruck,
    LucideMapPin,
    LucidePackagePlus,
    // LucideLoaderCircle
  ],
  templateUrl: './presentation/purchase-preferences.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchasePreferencesPageComponent implements OnInit, OnDestroy, PendingChangesAware {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(PurchasePreferencesFacade);
  private readonly patching = signal(false);
  private readonly subscriptions = new Subscription();

  protected readonly copy = PURCHASE_PREFERENCES_COPY;
  protected readonly messages = PURCHASE_PREFERENCES_MESSAGES;
  protected readonly residueTypes = RESIDUE_TYPE_OPTIONS;
  protected readonly sectors = SECTOR_OPTIONS;
  protected readonly products = PRODUCT_TYPE_OPTIONS;
  protected readonly units = UNIT_OPTIONS;
  protected readonly frequencies = PURCHASE_FREQUENCY_OPTIONS;
  protected readonly conditions = CONDITION_OPTIONS;
  protected readonly specificResidues = SPECIFIC_RESIDUE_OPTIONS;
  protected readonly preferredModes = PREFERRED_MODE_OPTIONS;
  protected readonly acceptedExchanges = ACCEPTED_EXCHANGE_OPTIONS;
  protected readonly priorities = PRIORITY_OPTIONS;
  protected readonly radiusRange = RADIUS_RANGE;

  protected readonly state = this.facade.state;
  protected readonly summary = this.facade.summary;
  protected readonly loading = this.facade.loading;
  protected readonly saveLoading = this.facade.saveLoading;
  protected readonly previewLoading = this.facade.previewLoading;
  protected readonly activateLoading = this.facade.activateLoading;
  protected readonly toastMessage = this.facade.toastMessage;

  protected readonly form = this.fb.nonNullable.group({
    residueType: ['organic'],
    sector: ['agroindustry'],
    productType: ['mango'],
    specificResidue: ['', [Validators.required]],
    requiredVolume: [0, [Validators.required, Validators.min(0.01)]],
    unit: ['tons'],
    purchaseFrequency: ['one_time'],
    minPriceUsd: [0, [Validators.required, Validators.min(0)]],
    maxPriceUsd: [0, [Validators.required, Validators.min(0)]],
    desiredCondition: ['fresh'],
    receivingLocation: ['', [Validators.required]],
    radiusKm: [50, [Validators.required, Validators.min(RADIUS_RANGE.min), Validators.max(RADIUS_RANGE.max)]],
    preferredMode: ['warehouse_pickup'],
    acceptedExchangeType: ['sale'],
    notes: [''],
    alertOnMatch: [true],
    priority: ['medium']
  });

  constructor() {
    effect(() => {
      const current = this.state();
      if (!current) {
        return;
      }

      this.patching.set(true);
      this.form.patchValue({
        residueType: current.formValue.desiredResidue.residueType,
        sector: current.formValue.desiredResidue.sector,
        productType: current.formValue.desiredResidue.productType,
        specificResidue: current.formValue.desiredResidue.specificResidue,
        requiredVolume: current.formValue.sourcing.requiredVolume,
        unit: current.formValue.sourcing.unit,
        purchaseFrequency: current.formValue.sourcing.purchaseFrequency,
        minPriceUsd: current.formValue.sourcing.minPriceUsd ?? 0,
        maxPriceUsd: current.formValue.sourcing.maxPriceUsd ?? 0,
        desiredCondition: current.formValue.sourcing.desiredCondition,
        receivingLocation: current.formValue.logistics.receivingLocation,
        radiusKm: current.formValue.logistics.radiusKm,
        preferredMode: current.formValue.logistics.preferredMode,
        acceptedExchangeType: current.formValue.logistics.acceptedExchangeType,
        notes: current.formValue.alerts.notes,
        alertOnMatch: current.formValue.alerts.alertOnMatch,
        priority: current.formValue.alerts.priority
      });
      this.form.markAsPristine();
      this.patching.set(false);
    });
  }

  ngOnInit(): void {
    this.facade.loadInitialState();

    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        if (this.patching()) {
          return;
        }

        this.syncStateFromForm();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  hasPendingChanges(): boolean {
    return this.form.dirty;
  }

  protected savePreference(): void {
    if (this.form.invalid || this.hasInvalidPriceRange()) {
      this.form.markAllAsTouched();
      return;
    }

    const state = this.state();
    if (!state) {
      return;
    }

    this.facade.savePreference(state);
    this.form.markAsPristine();
  }

  protected activateAlert(): void {
    const state = this.state();
    if (!state) {
      return;
    }

    this.facade.activateAlert(state);
  }

  protected preview(): void {
    this.syncStateFromForm();
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected setResidueType(
    value: PurchasePreferencesPageState['formValue']['desiredResidue']['residueType']
  ): void {
    this.form.controls.residueType.setValue(value);
  }

  protected residueTypeValue(): PurchasePreferencesPageState['formValue']['desiredResidue']['residueType'] {
    return this.form.controls.residueType
      .value as PurchasePreferencesPageState['formValue']['desiredResidue']['residueType'];
  }

  protected setRadiusKm(value: number): void {
    this.form.controls.radiusKm.setValue(value);
  }

  protected setCondition(value: MaterialCondition): void {
    this.form.controls.desiredCondition.setValue(value);
  }

  protected conditionValue(): MaterialCondition {
    return this.form.controls.desiredCondition.value as MaterialCondition;
  }

  protected fieldError(
    fieldName: keyof typeof this.form.controls,
    customMessage: string = this.messages.required
  ): string {
    const control = this.form.controls[fieldName];
    if (!control.touched || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.required;
    }

    if (control.hasError('min') || control.hasError('max')) {
      return customMessage;
    }

    return this.messages.required;
  }

  protected hasInvalidPriceRange(): boolean {
    const min = this.form.controls.minPriceUsd.value;
    const max = this.form.controls.maxPriceUsd.value;
    return max < min;
  }

  private syncStateFromForm(): void {
    const current = this.state();
    if (!current) {
      return;
    }

    const raw = this.form.getRawValue();
    const nextState: PurchasePreferencesPageState = {
      ...current,
      formValue: {
        desiredResidue: {
          residueType: raw.residueType as PurchasePreferencesPageState['formValue']['desiredResidue']['residueType'],
          sector: raw.sector as PurchasePreferencesPageState['formValue']['desiredResidue']['sector'],
          productType: raw.productType as PurchasePreferencesPageState['formValue']['desiredResidue']['productType'],
          specificResidue: raw.specificResidue
        },
        sourcing: {
          requiredVolume: raw.requiredVolume,
          unit: raw.unit as PurchasePreferencesPageState['formValue']['sourcing']['unit'],
          purchaseFrequency:
            raw.purchaseFrequency as PurchasePreferencesPageState['formValue']['sourcing']['purchaseFrequency'],
          minPriceUsd: raw.minPriceUsd,
          maxPriceUsd: raw.maxPriceUsd,
          desiredCondition:
            raw.desiredCondition as PurchasePreferencesPageState['formValue']['sourcing']['desiredCondition']
        },
        logistics: {
          receivingLocation: raw.receivingLocation,
          radiusKm: raw.radiusKm,
          preferredMode:
            raw.preferredMode as PurchasePreferencesPageState['formValue']['logistics']['preferredMode'],
          acceptedExchangeType:
            raw.acceptedExchangeType as PurchasePreferencesPageState['formValue']['logistics']['acceptedExchangeType']
        },
        alerts: {
          notes: raw.notes,
          alertOnMatch: raw.alertOnMatch,
          priority: raw.priority as PurchasePreferencesPageState['formValue']['alerts']['priority']
        }
      }
    };

    this.facade.updateState(nextState);
  }
}
