import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideCreditCard, LucideLoaderCircle, LucideShoppingCart, LucideUniversity } from '@lucide/angular';
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
export class CheckoutPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly facade = inject(CheckoutFacade);
  protected readonly listingId = this.route.snapshot.paramMap.get('listingId') ?? '';

  protected readonly createLoading = this.facade.createLoading;
  protected readonly paymentLoading = this.facade.paymentLoading;
  protected readonly order = this.facade.order;
  protected readonly paymentResult = this.facade.paymentResult;
  protected readonly paymentApproved = this.facade.paymentApproved;
  protected readonly toastMessage = this.facade.toastMessage;

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

  protected submitOrder(): void {
    if (this.orderForm.invalid || !this.listingId) {
      this.orderForm.markAllAsTouched();
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
