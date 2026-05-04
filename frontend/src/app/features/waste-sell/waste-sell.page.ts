import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LucideCircleDollarSign,
  LucideEllipsis,
  LucideImage,
  LucideInfo,
  LucideLoaderCircle,
  LucideMapPin,
  LucideSendHorizontal,
  LucideTruck,
  LucideWandSparkles
  ,
  LucideArrowLeft
} from '@lucide/angular';
import { PendingChangesAware } from '../../core/models/pending-changes.model';
import {
  longTextValidator,
  safeAddressValidator,
  safeBusinessNameValidator,
  sanitizeInputValue
} from '../../shared/helpers/validators';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { WasteSellFacade } from './application/waste-sell.facade';
import {
  CONDITION_OPTIONS,
  DELIVERY_MODE_OPTIONS,
  EXCHANGE_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  RESIDUE_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STORAGE_TIME_OPTIONS,
  UNIT_OPTIONS,
  WASTE_FORM_MESSAGES,
  WASTE_SELL_COPY
} from './data/waste-sell.constants';
import { WasteMediaUpload, WasteSellPageState } from './domain/waste-sell.models';
import { WastePreviewCardComponent } from './presentation/components/waste-preview-card/waste-preview-card.component';
import { WasteUploadZoneComponent } from './presentation/components/waste-upload-zone/waste-upload-zone.component';

@Component({
  selector: 'app-waste-sell-page',
  imports: [
    ReactiveFormsModule,
    SectionHeaderComponent,
    WasteUploadZoneComponent,
    WastePreviewCardComponent,
    LucideSendHorizontal,
    LucideInfo,
    LucideCircleDollarSign,
    LucideTruck,
    LucideImage,
    LucideEllipsis,
    LucideMapPin,
    LucideWandSparkles,
    LucideLoaderCircle,
    LucideArrowLeft
  ],
  templateUrl: './presentation/waste-sell.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WasteSellPageComponent implements OnInit, OnDestroy, PendingChangesAware {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(WasteSellFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly patching = signal(false);
  private readonly createdObjectUrls = new Set<string>();
  private readonly subscriptions = new Subscription();
  protected readonly isEditing = signal(false);

  protected readonly copy = WASTE_SELL_COPY;
  protected readonly messages = WASTE_FORM_MESSAGES;

  protected readonly residueTypes = RESIDUE_TYPE_OPTIONS;
  protected readonly sectors = SECTOR_OPTIONS;
  protected readonly productTypes = PRODUCT_TYPE_OPTIONS;
  protected readonly unitOptions = UNIT_OPTIONS;
  protected readonly frequencyOptions = FREQUENCY_OPTIONS;
  protected readonly exchangeTypeOptions = EXCHANGE_TYPE_OPTIONS;
  protected readonly deliveryModeOptions = DELIVERY_MODE_OPTIONS;
  protected readonly storageTimeOptions = STORAGE_TIME_OPTIONS;
  protected readonly conditionOptions = CONDITION_OPTIONS;

  protected readonly loading = this.facade.loading;
  protected readonly publishLoading = this.facade.publishLoading;
  protected readonly previewLoading = this.facade.previewLoading;
  protected readonly mediaSyncLoading = this.facade.mediaSyncLoading;
  protected readonly state = this.facade.state;
  protected readonly preview = this.facade.preview;
  protected readonly completion = this.facade.completion;
  protected readonly statusLabel = this.facade.statusLabel;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly valorizationIdeasLoading = this.facade.valorizationIdeasLoading;
  protected readonly valorizationIdeas = this.facade.valorizationIdeas;
  protected readonly valorizationIdeasGenerated = this.facade.valorizationIdeasGenerated;
  protected readonly valorizationIdeasStale = this.facade.valorizationIdeasStale;

  protected readonly form = this.fb.nonNullable.group({
    residueType: ['organic'],
    sector: ['agriculture'],
    productType: ['mango', [Validators.required, Validators.maxLength(80), safeBusinessNameValidator]],
    specificResidue: ['', [Validators.required, Validators.maxLength(120), safeBusinessNameValidator]],
    shortDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), longTextValidator(500)]],
    quantity: [10, [Validators.required, Validators.min(1)]],
    unit: ['tons'],
    generationFrequency: ['single'],
    estimatedCostPerUnit: [45, [Validators.required, Validators.min(0.01)]],
    warehouseAddress: ['', [Validators.required, Validators.maxLength(180), safeAddressValidator]],
    maxStorageTime: ['48h'],
    exchangeType: ['sale'],
    deliveryMode: ['warehouse_pickup'],
    immediateAvailability: [true],
    condition: ['fresh'],
    restrictionsNotes: ['', [Validators.maxLength(300), longTextValidator(300)]],
    nextAvailabilityDate: ['', [Validators.required]]
  });

  protected readonly formSnapshot = signal(this.form.getRawValue());

  protected readonly estimatedTotalValue = computed(() => {
    const value = this.formSnapshot();
    return Number(value.quantity) * Number(value.estimatedCostPerUnit);
  });

  protected readonly mediaUploads = computed<readonly WasteMediaUpload[]>(
    () => this.state()?.formValue.mediaUploads ?? []
  );

  protected readonly hasEmptyState = computed(() => this.mediaUploads().length === 0);

  constructor() {
    effect(() => {
      const current = this.state();
      if (!current) {
        return;
      }

      this.patching.set(true);
      this.form.patchValue({
        residueType: current.formValue.residueType,
        sector: current.formValue.sector,
        productType: current.formValue.productType,
        specificResidue: current.formValue.specificResidue,
        shortDescription: current.formValue.shortDescription,
        quantity: current.formValue.volume.quantity,
        unit: current.formValue.volume.unit,
        generationFrequency: current.formValue.volume.generationFrequency,
        estimatedCostPerUnit: current.formValue.volume.estimatedCostPerUnit,
        warehouseAddress: current.formValue.logistics.warehouseAddress,
        maxStorageTime: current.formValue.logistics.maxStorageTime,
        exchangeType: current.formValue.logistics.exchangeType,
        deliveryMode: current.formValue.logistics.deliveryMode,
        immediateAvailability: current.formValue.logistics.immediateAvailability,
        condition: current.formValue.additional.condition,
        restrictionsNotes: current.formValue.additional.restrictionsNotes,
        nextAvailabilityDate: current.formValue.additional.nextAvailabilityDate
      });
      this.formSnapshot.set(this.form.getRawValue());
      this.form.markAsPristine();
      this.patching.set(false);
    });
  }

  protected goBack(): void {
    void this.router.navigateByUrl('/app/my-listings');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const editId = params.get('edit');
        this.isEditing.set(!!editId);
        this.facade.loadInitialState(editId);
      })
    );

    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        if (this.patching()) {
          return;
        }

        this.formSnapshot.set(this.form.getRawValue());
        this.syncStateFromForm();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.createdObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.createdObjectUrls.clear();
    this.facade.resetTransientValorizationIdeas();
  }

  hasPendingChanges(): boolean {
    return this.form.dirty;
  }

  protected publish(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const nextState = this.state();
    if (!nextState) {
      return;
    }

    this.facade.publish(nextState);
    this.form.markAsPristine();
  }

  protected previewNow(): void {
    const nextState = this.state();
    if (!nextState) {
      return;
    }

    this.facade.updateState(nextState);
  }

  protected analyzeWithAi(): void {
    const nextState = this.state();
    if (!nextState) {
      return;
    }

    const missingFields = this.getMissingValorizationFields();
    if (missingFields.length > 0) {
      this.facade.toastMessage.set(`Completa estos campos antes de analizar con IA: ${missingFields.join(', ')}.`);
      return;
    }

    this.facade.generateValorizationIdeas(nextState);
  }

  protected valorizationInfoMessage(): string {
    if (this.valorizationIdeasStale()) {
      return 'Los datos cambiaron. Actualiza las ideas para obtener recomendaciones mas precisas.';
    }

    if (this.valorizationIdeasGenerated()) {
      return 'Ideas generadas segun los datos actuales del formulario.';
    }

    return 'Completa los datos principales y analiza oportunidades antes de publicar.';
  }

  protected valorizationActionLabel(): string {
    return this.valorizationIdeasGenerated() ? 'Actualizar ideas' : 'Analizar con IA antes de publicar';
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  protected onFilesAdded(files: readonly File[]): void {
    const currentMedia = this.mediaUploads();
    const availableSlots = Math.max(0, 5 - currentMedia.length);

    if (availableSlots === 0) {
      this.facade.toastMessage.set(this.messages.mediaLimit);
      return;
    }

    const accepted = files
      .slice(0, availableSlots)
      .filter((file) => {
        const validationMessage = this.validateMediaFile(file);
        if (validationMessage) {
          this.facade.toastMessage.set(validationMessage);
          return false;
        }

        return true;
      })
      .map((file) => {
      const previewUrl = URL.createObjectURL(file);
      this.createdObjectUrls.add(previewUrl);

      const id = crypto.randomUUID();
      this.facade.registerPendingFile(id, file);

      const upload: WasteMediaUpload = {
        id,
        name: file.name,
        previewUrl,
        sizeKb: Math.round(file.size / 1024),
        type: file.type,
        uploadStatus: 'pending',
        warningMessage: null
      };

      return upload;
    });

    this.facade.updateMedia([...currentMedia, ...accepted]);
  }

  protected onFileRemoved(id: string): void {
    const media = this.mediaUploads().find((item) => item.id === id);
    if (media?.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(media.previewUrl);
      this.createdObjectUrls.delete(media.previewUrl);
    }

    this.facade.removeMedia(id);
  }

  protected fieldError(fieldName: keyof typeof this.form.controls): string {
    const control = this.form.controls[fieldName];
    if (!control.touched || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.required;
    }

    if (control.hasError('min')) {
      return this.messages.positiveNumber;
    }

    if (control.hasError('maxlength')) {
      return this.messages.maxLength;
    }

    if (
      control.hasError('suspiciousContent') ||
      control.hasError('meaninglessValue') ||
      control.hasError('invalidFormat')
    ) {
      return this.messages.invalidText;
    }

    return this.messages.required;
  }

  protected sanitizeTextField(
    fieldName: 'productType' | 'specificResidue' | 'shortDescription' | 'warehouseAddress' | 'restrictionsNotes',
    mode: 'businessName' | 'address' | 'text'
  ): void {
    const control = this.form.controls[fieldName];
    const sanitized = sanitizeInputValue(control.getRawValue(), mode);
    if (sanitized !== control.getRawValue()) {
      control.setValue(sanitized);
    }
  }

  protected sourceBadge(source: string): string {
    return source === 'deepseek' ? 'Generado con IA' : 'Recomendacion base';
  }

  protected viabilityLabel(level: string): string {
    switch (level) {
      case 'high':
        return 'Alta viabilidad';
      case 'low':
        return 'Viabilidad baja';
      default:
        return 'Viabilidad media';
    }
  }

  protected viabilityBadgeClasses(level: string): string {
    switch (level) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700';
      case 'low':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  private syncStateFromForm(): void {
    const current = this.state();
    if (!current) {
      return;
    }

    const raw = this.form.getRawValue();
    const nextState: WasteSellPageState = {
      ...current,
      formValue: {
        ...current.formValue,
        residueType: raw.residueType as WasteSellPageState['formValue']['residueType'],
        sector: raw.sector as WasteSellPageState['formValue']['sector'],
        productType: raw.productType as WasteSellPageState['formValue']['productType'],
        specificResidue: raw.specificResidue,
        shortDescription: raw.shortDescription,
        volume: {
          quantity: raw.quantity,
          unit: raw.unit as WasteSellPageState['formValue']['volume']['unit'],
          generationFrequency: raw.generationFrequency,
          estimatedCostPerUnit: raw.estimatedCostPerUnit
        },
        logistics: {
          warehouseAddress: raw.warehouseAddress,
          maxStorageTime: raw.maxStorageTime,
          exchangeType: raw.exchangeType as WasteSellPageState['formValue']['logistics']['exchangeType'],
          deliveryMode: raw.deliveryMode as WasteSellPageState['formValue']['logistics']['deliveryMode'],
          immediateAvailability: raw.immediateAvailability
        },
        additional: {
          condition: raw.condition as WasteSellPageState['formValue']['additional']['condition'],
          restrictionsNotes: raw.restrictionsNotes,
          nextAvailabilityDate: raw.nextAvailabilityDate
        }
      }
    };

    this.facade.updateState(nextState);
  }

  private getMissingValorizationFields(): string[] {
    const raw = this.form.getRawValue();

    return [
      { value: raw.residueType, label: 'tipo de residuo' },
      { value: raw.productType, label: 'producto relacionado' },
      { value: raw.specificResidue, label: 'residuo especifico' },
      { value: raw.shortDescription, label: 'descripcion detallada' }
    ]
      .filter((field) => !field.value || !field.value.toString().trim())
      .map((field) => field.label);
  }

  private validateMediaFile(file: File): string | null {
    if (file.size > 5 * 1024 * 1024) {
      return 'Cada imagen debe pesar como maximo 5 MB.';
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Solo se permiten imagenes JPG, PNG o WEBP.';
    }

    return null;
  }
}
