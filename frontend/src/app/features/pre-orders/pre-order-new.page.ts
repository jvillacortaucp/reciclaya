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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LucideCalendarDays,
  LucideCircleAlert,
  LucideFileClock,
  LucideSave,
  LucideSettings,
  LucideSquareArrowOutUpRight
} from '@lucide/angular';
import { PaymentMethodSelectorComponent } from './presentation/components/payment-method-selector/payment-method-selector.component';
import { PreOrderEconomicSummaryComponent } from './presentation/components/pre-order-economic-summary/pre-order-economic-summary.component';
import { PreOrdersFacade } from './application/pre-orders.facade';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-pre-order-new-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PaymentMethodSelectorComponent,
    PreOrderEconomicSummaryComponent,
    SectionHeaderComponent,
    LucideSettings,
    LucideCalendarDays,
    LucideCircleAlert,
    LucideSave,
    LucideSquareArrowOutUpRight,
    LucideFileClock
  ],
  templateUrl: './presentation/pre-order-new.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderNewPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(PreOrdersFacade);
  private readonly subscriptions = new Subscription();
  private readonly patching = signal(false);

  protected readonly listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
  protected readonly summaryLoading = this.facade.summaryLoading;
  protected readonly screenState = this.facade.screenState;
  protected readonly economicSummary = this.facade.economicSummary;
  protected readonly toastMessage = this.facade.toastMessage;

  protected readonly form = this.fb.nonNullable.group({
    quantity: [10, [Validators.required, Validators.min(1)]],
    desiredDate: ['', [Validators.required]],
    reserveStock: [true],
    notes: [''],
    paymentMethod: ['transfer', [Validators.required]]
  });

  constructor() {
    effect(() => {
      const state = this.screenState();
      if (!state) {
        return;
      }

      this.patching.set(true);
      this.form.patchValue({
        quantity: state.defaultQuantity,
        desiredDate: state.defaultDate,
        reserveStock: true,
        notes: state.defaultNotes,
        paymentMethod: state.selectedPaymentType
      });
      this.patching.set(false);
    });
  }

  ngOnInit(): void {
    this.facade.loadScreenState(this.listingId);

    this.subscriptions.add(
      this.form.valueChanges.subscribe(() => {
        if (this.patching()) {
          return;
        }

        this.facade.simulateSummary(this.buildRequestFromForm());
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected goBack(): void {
    void this.router.navigate(['/app/marketplace', this.listingId]);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.create(this.buildRequestFromForm('submitted'));
  }

  protected saveDraft(): void {
    this.facade.create(this.buildRequestFromForm('draft'));
  }

  protected selectPayment(type: 'transfer' | 'cash' | 'credit'): void {
    this.form.controls.paymentMethod.setValue(type);
  }

  protected get selectedPaymentMethod(): 'transfer' | 'cash' | 'credit' {
    return this.form.controls.paymentMethod.value as 'transfer' | 'cash' | 'credit';
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  private buildRequestFromForm(status?: 'draft' | 'submitted') {
    const state = this.screenState();
    const value = this.form.getRawValue();
    const selectedType = value.paymentMethod as 'transfer' | 'cash' | 'credit';
    const paymentLabel =
      state?.paymentMethods.find((method) => method.type === selectedType)?.label ?? selectedType;

    return {
      listingId: this.listingId,
      quantity: value.quantity,
      desiredDate: value.desiredDate,
      reserveStock: Boolean(value.reserveStock),
      notes: value.notes ?? '',
      paymentMethod: {
        type: selectedType,
        label: paymentLabel
      },
      status
    };
  }
}

