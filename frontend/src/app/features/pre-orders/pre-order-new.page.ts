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
// SimulatedPaymentStatusComponent and PreOrderConfirmationCardComponent removed from template
import { PaymentMethodType, SimulatedPaymentCard } from './models/pre-order.model';
import { ToastService } from '../../core/services/toast.service';
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
    CardPaymentModalComponent,
    LucideSettings2,
    LucideCalendarDays,
    LucideChevronRight
  ],
  templateUrl: './presentation/pre-order-new.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderNewPageComponent implements OnInit, OnDestroy {
  private static readonly EMPTY_CARD: SimulatedPaymentCard = {
    id: 'temporary-card',
    holderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    brand: 'generic',
    lastFour: ''
  };

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
  protected readonly screenError = this.facade.screenError;
  protected readonly summaryLoading = this.facade.summaryLoading;
  protected readonly submitting = this.facade.submitting;
  protected readonly screenState = this.facade.screenState;
  protected readonly pricingSummary = this.facade.economicSummary;
  protected readonly paymentStatus = this.facade.paymentStatus;
  protected readonly createdPreOrder = this.facade.createdPreOrder;
  protected readonly downloadingQuotation = this.facade.downloadingQuotation;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly listing = computed(() => this.screenState()?.listing ?? null);
  protected readonly seller = computed(() => this.screenState()?.listing.seller ?? null);
  // Only expose card and contraentrega (cash_on_delivery) for now
  protected readonly paymentMethods = computed(() =>
    (this.screenState()?.paymentMethods ?? []).filter((m) => m.id === 'card' || m.id === 'cash_on_delivery')
  );
  protected readonly maxQuantityLabel = computed(
    () => `MAX ${this.listing()?.availableQuantity ?? 0}`
  );
  protected readonly cardModalOpen = signal(false);
  protected readonly configuredCard = signal<SimulatedPaymentCard | null>(null);
  private previousPaymentMethod: PaymentMethodType | null = null;
  // pending pre-order when waiting for card confirmation
  private pendingPreOrderInput: any | null = null;
  private awaitingCardConfirmation = signal(false);

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
      }
    });

    effect(() => {
      const message = this.toastMessage();
      if (!message || message === this.copy.successMessage) {
        return;
      }

      this.toast.error(message);
      this.facade.clearToastMessage();
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
        paymentMethod: (state.paymentMethods.find((p) => p.id === 'card' || p.id === 'cash_on_delivery')?.id) ?? 'card'
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

        this.facade.simulateSummary(
          this.listingId,
          Number(value.quantity ?? 0),
          (value.paymentMethod ?? 'bank_transfer') as PaymentMethodType,
          value.desiredDate ?? new Date().toISOString().slice(0, 10),
          value.notes ?? '',
          Boolean(value.reserveStock)
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected goToDetail(): void {
    void this.router.navigate(['/marketplace', this.listingId]);
  }

  protected requestInfo(): void {
    this.toast.info('Solicitud enviada al proveedor. Te contactará en breve.');
  }

  protected simulateAndSubmit(): void {
    // kept for backward compatibility if needed
    this.simulateAndSubmitWrapped();
  }

  protected simulateAndSubmitWrapped(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const listing = this.listing();
    if (!listing) {
      return;
    }

    const input = {
      listingId: listing.id,
      requestedQuantity: Number(this.form.controls.quantity.value),
      unit: listing.unit,
      paymentMethod: this.form.controls.paymentMethod.value,
      requestedAt: this.form.controls.desiredDate.value,
      notes: this.form.controls.notes.value ?? '',
      reserveStock: Boolean(this.form.controls.reserveStock.value)
    };

    if (this.form.controls.paymentMethod.value === 'card') {
      // open card modal and wait confirmation before submitting
      this.pendingPreOrderInput = input;
      this.awaitingCardConfirmation.set(true);
      this.cardModalOpen.set(true);
      return;
    }

    this.facade.submitPreOrder(input);
    this.toast.info(this.copy.processingMessage);
  }

  protected selectPayment(type: PaymentMethodType): void {
    // Do not open card modal on selection; only change selected payment method
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
    const normalized: SimulatedPaymentCard = {
      ...PreOrderNewPageComponent.EMPTY_CARD,
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
    // If we were awaiting confirmation for a pending pre-order, submit it now
    if (this.awaitingCardConfirmation()) {
      if (this.pendingPreOrderInput) {
        this.facade.submitPreOrder(this.pendingPreOrderInput);
        this.toast.info(this.copy.processingMessage);
      }
      this.pendingPreOrderInput = null;
      this.awaitingCardConfirmation.set(false);
    }
  }

  protected downloadQuote(): void {
    const preOrderId = this.createdPreOrder()?.id;
    if (!preOrderId) {
      this.toast.info('Primero genera la pre-orden para descargar su cotizacion.');
      return;
    }

    this.facade.downloadQuotationPdf(preOrderId);
  }

  protected get selectedPaymentMethod(): PaymentMethodType {
    return this.form.controls.paymentMethod.value;
  }

  protected get cardMockData(): SimulatedPaymentCard | null {
    return this.configuredCard();
  }
}
