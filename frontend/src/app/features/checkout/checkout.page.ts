import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideCreditCard, LucideLoaderCircle, LucideShoppingCart, LucideUniversity } from '@lucide/angular';
import { catchError, EMPTY } from 'rxjs';
import { AuthFacade } from '../auth/services/auth.facade';
import { ListingDetailHttpRepository } from '../listing-detail/infrastructure/listing-detail.http.repository';
import { ListingDetailEntity } from '../listing-detail/domain/listing-detail.models';
import { Profile } from '../profile/profile.models';
import { ProfileHttpRepository } from '../profile/profile-http.repository';
import { RegulatoryComplianceStore } from '../../core/regulatory/regulatory-compliance.store';
import { classifyRegulatoryLevel, evaluateBuyerCompliance, getLevelBadgeClasses, getRegulatoryRule } from '../../core/regulatory/regulatory.rules';
import { RegulatoryLevel } from '../../core/regulatory/regulatory.models';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { CheckoutFacade } from './application/checkout.facade';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SectionHeaderComponent,
    LucideShoppingCart,
    LucideCreditCard,
    LucideUniversity,
    LucideLoaderCircle
  ],
  templateUrl: './presentation/checkout.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authFacade = inject(AuthFacade);
  private readonly listingRepository = inject(ListingDetailHttpRepository);
  private readonly profileRepository = inject(ProfileHttpRepository);
  private readonly regulatoryStore = inject(RegulatoryComplianceStore);
  protected readonly facade = inject(CheckoutFacade);
  protected readonly listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
  protected readonly listingDetail = signal<ListingDetailEntity | null>(null);
  protected readonly profile = signal<Profile | null>(null);

  protected readonly createLoading = this.facade.createLoading;
  protected readonly paymentLoading = this.facade.paymentLoading;
  protected readonly order = this.facade.order;
  protected readonly paymentResult = this.facade.paymentResult;
  protected readonly paymentApproved = this.facade.paymentApproved;
  protected readonly toastMessage = this.facade.toastMessage;
  protected readonly levelBadgeClasses = getLevelBadgeClasses;
  protected readonly regulatoryLevel = computed<RegulatoryLevel>(() => {
    const detail = this.listingDetail();
    if (!detail) {
      return 2;
    }
    return classifyRegulatoryLevel({
      residueType: detail.wasteType,
      sector: detail.sector,
      productType: detail.productType,
      specificResidue: detail.specificResidueType,
      title: detail.title,
      description: detail.description,
      restrictions: detail.restrictions,
      quantity: detail.volume.amount,
      unit: detail.volume.unit
    });
  });
  protected readonly regulatoryRule = computed(() => getRegulatoryRule(this.regulatoryLevel()));
  protected readonly buyerComplianceEvaluation = computed(() =>
    evaluateBuyerCompliance(
      this.regulatoryLevel(),
      this.profile(),
      this.regulatoryStore.getRecord(this.profile()?.id ?? this.authFacade.user()?.id).buyer
    )
  );
  protected readonly canProceedWithCheckout = computed(() => this.buyerComplianceEvaluation().eligible);

  protected readonly orderForm = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    reserveStock: [false],
    notes: ['']
  });

  protected readonly paymentForm = this.fb.nonNullable.group({
    paymentMethod: ['card'],
    cardHolder: [''],
    cardNumber: [''],
    expirationMonth: [''],
    expirationYear: [''],
    cvv: [''],
    simulateResult: ['approved']
  });

  ngOnInit(): void {
    if (this.listingId) {
      this.listingRepository
        .getById(this.listingId)
        .pipe(catchError(() => EMPTY))
        .subscribe((detail) => this.listingDetail.set(detail));
    }

    this.profileRepository
      .getProfile()
      .pipe(catchError(() => EMPTY))
      .subscribe((profile) => this.profile.set(profile));
  }

  protected submitOrder(): void {
    if (this.orderForm.invalid || !this.listingId) {
      this.orderForm.markAllAsTouched();
      return;
    }

    if (!this.canProceedWithCheckout()) {
      this.facade.toastMessage.set(
        `No puedes crear la orden hasta completar: ${this.buyerComplianceEvaluation().missingRequired.map((item) => item.label).join(', ')}.`
      );
      return;
    }

    const value = this.orderForm.getRawValue();
    this.facade.createFromListing(this.listingId, {
      quantity: value.quantity,
      reserveStock: value.reserveStock,
      notes: value.notes
    });
  }

  protected submitPayment(): void {
    const order = this.order();
    if (!order) {
      return;
    }

    if (!this.canProceedWithCheckout()) {
      return;
    }

    const value = this.paymentForm.getRawValue();
    this.facade.simulatePayment({
      orderId: order.orderId,
      paymentMethod: value.paymentMethod as 'card' | 'bank_transfer' | 'yape',
      cardHolder: value.paymentMethod === 'card' ? value.cardHolder : undefined,
      cardNumber: value.paymentMethod === 'card' ? value.cardNumber : undefined,
      expirationMonth: value.paymentMethod === 'card' ? value.expirationMonth : undefined,
      expirationYear: value.paymentMethod === 'card' ? value.expirationYear : undefined,
      cvv: value.paymentMethod === 'card' ? value.cvv : undefined,
      simulateResult: value.simulateResult as 'approved' | 'rejected'
    });

    this.paymentForm.patchValue({
      cardNumber: '',
      cvv: ''
    });
  }

  protected goToOrders(): void {
    this.facade.goToOrders();
  }

  protected dismissToast(): void {
    this.facade.clearToast();
  }

  ngOnDestroy(): void {
    this.facade.reset();
  }
}
