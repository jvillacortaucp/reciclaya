import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PreOrder } from '../../core/models/app.models';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { PreOrdersFacade } from './application/pre-orders.facade';

@Component({
  selector: 'app-pre-order-new-page',
  imports: [ReactiveFormsModule, SectionHeaderComponent],
  templateUrl: './presentation/pre-order-new.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderNewPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(PreOrdersFacade);

  protected readonly listingId = this.route.snapshot.paramMap.get('listingId') ?? '';
  protected readonly form = this.fb.nonNullable.group({
    quantity: [100, [Validators.required, Validators.min(1)]],
    desiredDate: ['', [Validators.required]],
    paymentMethod: ['transfer', [Validators.required]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const subtotal = raw.quantity * 1.2;
    const preOrder: PreOrder = {
      id: `po-${Date.now()}`,
      listingId: this.listingId,
      buyerId: 'usr-001',
      quantity: raw.quantity,
      desiredDate: raw.desiredDate,
      status: 'draft',
      paymentMethod: { type: raw.paymentMethod as 'transfer' | 'cash' | 'credit', label: raw.paymentMethod },
      pricing: {
        subtotal,
        logisticsFee: 80,
        taxes: subtotal * 0.18,
        total: subtotal * 1.18 + 80,
        currency: 'USD'
      }
    };

    this.facade.create(preOrder);
    void this.router.navigateByUrl('/app/pre-orders');
  }
}
