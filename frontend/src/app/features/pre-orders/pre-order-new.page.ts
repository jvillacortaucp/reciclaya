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
  LucideCalendarDays,
  LucideChevronRight,
  LucideSettings2
} from '@lucide/angular';
import { PaymentMethodSelectorComponent } from './presentation/components/payment-method-selector/payment-method-selector.component';
import { PreOrderEconomicSummaryComponent } from './presentation/components/pre-order-economic-summary/pre-order-economic-summary.component';
import { PreOrdersFacade } from './application/pre-orders.facade';
import { PRE_ORDER_COPY } from './data/pre-order.constants';
import { ProductPreOrderSummaryComponent } from './presentation/components/product-pre-order-summary/product-pre-order-summary.component';
import { SellerInfoCardComponent } from './presentation/components/seller-info-card/seller-info-card.component';
import { SimulatedPaymentStatusComponent } from './presentation/components/simulated-payment-status/simulated-payment-status.component';
import { PreOrderConfirmationCardComponent } from './presentation/components/pre-order-confirmation-card/pre-order-confirmation-card.component';
import { PaymentMethodType } from './models/pre-order.model';
import { ToastService } from '../../core/services/toast.service';
import { MOCK_PAYMENT_CARD, MockPaymentCard } from './data/payment-card.mock';
import {
  CardPaymentConfirmation,
  CardPaymentModalComponent
} from './components/card-payment-modal/card-payment-modal.component';

@Component({
  selector: 'app-pre-order-new-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PaymentMethodSelectorComponent,
    PreOrderEconomicSummaryComponent,
    ProductPreOrderSummaryComponent,
    SellerInfoCardComponent,
    SimulatedPaymentStatusComponent,
    PreOrderConfirmationCardComponent,
    CardPaymentModalComponent,
    LucideSettings2,
    LucideCalendarDays,
    LucideChevronRight
  ],
  templateUrl: './presentation/pre-order-new.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderNewPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(PreOrdersFacade);
  private readonly toast = inject(ToastService);
  private readonly subscriptions = new Subscription();
  private readonly patching = signal(false);

  protected readonly copy = PRE_ORDER_COPY;
  protected readonly listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
  protected readonly screenLoading = this.facade.screenLoading;
  protected readonly summaryLoading = this.facade.summaryLoading;
  protected readonly submitting = this.facade.submitting;
  protected readonly screenState = this.facade.screenState;
  protected readonly pricingSummary = this.facade.economicSummary;
  protected readonly paymentStatus = this.facade.paymentStatus;
  protected readonly createdPreOrder = this.facade.createdPreOrder;
  protected readonly listing = computed(() => this.screenState()?.listing ?? null);
  protected readonly seller = computed(() => this.screenState()?.listing.seller ?? null);
  protected readonly paymentMethods = computed(() => this.screenState()?.paymentMethods ?? []);
  protected readonly maxQuantityLabel = computed(
    () => `MAX ${this.listing()?.availableQuantity ?? 0}`
  );
  protected readonly cardModalOpen = signal(false);
  protected readonly configuredCard = signal<MockPaymentCard | null>(null);
  private previousPaymentMethod: PaymentMethodType | null = null;

  protected readonly form = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(0.1)]],
    desiredDate: ['', [Validators.required]],
    reserveStock: [true],
    notes: [''],
    paymentMethod: ['card' as PaymentMethodType, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const status = this.paymentStatus();
      if (status === 'success') {
        this.toast.success(this.copy.successMessage);
      } else if (status === 'failed') {
        this.toast.error(this.copy.failureMessage);
      }
    });

    effect(() => {
      const state = this.screenState();
      if (!state) {
        return;
      }

      this.patching.set(true);
      this.form.patchValue({
        quantity: state.defaultRequestedQuantity,
        desiredDate: state.defaultPickupDate,
        reserveStock: true,
        notes: state.defaultNotes ?? '',
        paymentMethod: state.paymentMethods[0]?.id ?? 'card'
      });
      this.patching.set(false);
    });
  }

  ngOnInit(): void {
    this.facade.loadScreenState(this.listingId);

    this.subscriptions.add(
      this.form.valueChanges.subscribe((value) => {
        if (this.patching()) {
          return;
        }

        this.facade.simulateSummary(this.listingId, Number(value.quantity ?? 0));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected goToDetail(): void {
    void this.router.navigate(['/app/marketplace', this.listingId]);
  }

  protected requestInfo(): void {
    this.toast.info('Solicitud enviada al proveedor. Te contactará en breve.');
  }

  protected simulateAndSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const listing = this.listing();
    if (!listing) {
      return;
    }

    this.facade.submitPreOrder({
      listingId: listing.id,
      requestedQuantity: Number(this.form.controls.quantity.value),
      unit: listing.unit,
      paymentMethod: this.form.controls.paymentMethod.value,
      requestedAt: this.form.controls.desiredDate.value,
      notes: this.form.controls.notes.value ?? '',
      reserveStock: Boolean(this.form.controls.reserveStock.value)
    });
    this.toast.info(this.copy.processingMessage);
  }

  protected selectPayment(type: PaymentMethodType): void {
    if (type === 'card') {
      this.previousPaymentMethod = this.form.controls.paymentMethod.value;
      this.form.controls.paymentMethod.setValue(type);
      this.cardModalOpen.set(true);
      return;
    }

    this.previousPaymentMethod = null;
    this.cardModalOpen.set(false);
    this.form.controls.paymentMethod.setValue(type);
    this.facade.resetPaymentState();
  }

  protected onCardModalClosed(): void {
    this.cardModalOpen.set(false);
    if (!this.configuredCard() && this.previousPaymentMethod && this.previousPaymentMethod !== 'card') {
      this.form.controls.paymentMethod.setValue(this.previousPaymentMethod);
    }
  }

  protected onCardModalConfirmed(data: CardPaymentConfirmation): void {
    const normalized: MockPaymentCard = {
      ...MOCK_PAYMENT_CARD,
      holderName: data.holderName,
      cardNumber: data.cardNumber,
      expiryDate: data.expiryDate,
      cvv: data.cvv,
      lastFour: data.cardNumber.slice(-4)
    };

    this.configuredCard.set(normalized);
    this.cardModalOpen.set(false);
    this.form.controls.paymentMethod.setValue('card');
    this.toast.success('Tarjeta simulada configurada');
  }

  protected downloadQuote(): void {
    this.toast.success('Cotización descargada correctamente.');
  }

  protected get selectedPaymentMethod(): PaymentMethodType {
    return this.form.controls.paymentMethod.value;
  }

  protected get cardMockData(): MockPaymentCard {
    return this.configuredCard() ?? MOCK_PAYMENT_CARD;
  }
}
