import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { UserRole } from '../../../../../core/models/app.models';
import { COMPANY_REGISTER_STEPS, INTENT_OPTIONS, REGISTER_PAGE_COPY, REGISTER_VALIDATION_MESSAGES } from '../../../data/register.constants';
import { AccountType, CompanyRegistrationPayload, RegistrationIntent } from '../../../domain/register.models';
import { hasPasswordMismatch } from '../../helpers/register-form.helpers';

@Component({
  selector: 'app-company-register-form',
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff],
  templateUrl: './company-register-form.component.html',
  styleUrl: './company-register-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyRegisterFormComponent {
  private readonly fb = new FormBuilder();

  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Output() readonly submitted = new EventEmitter<CompanyRegistrationPayload>();

  protected readonly copy = REGISTER_PAGE_COPY;
  protected readonly steps = COMPANY_REGISTER_STEPS;
  protected readonly intents = INTENT_OPTIONS;
  protected readonly messages = REGISTER_VALIDATION_MESSAGES;

  protected readonly activeStep = signal(0);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly companyForm = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    businessName: ['', [Validators.required]],
    mobilePhone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    legalRepresentative: ['', [Validators.required]],
    position: ['', [Validators.required]]
  });

  protected readonly credentialsForm = this.fb.nonNullable.group({
    intent: [RegistrationIntent.Both, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  protected readonly isLastStep = computed(() => this.activeStep() === this.steps.length - 1);

  protected goNext(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) {
      return;
    }

    this.activeStep.set(1);
  }

  protected goBack(): void {
    this.activeStep.set(0);
  }

  protected submit(): void {
    this.credentialsForm.markAllAsTouched();
    if (this.credentialsForm.invalid || this.passwordMismatch()) {
      return;
    }

    const payload: CompanyRegistrationPayload = {
      accountType: AccountType.Company,
      role: UserRole.Buyer,
      company: this.companyForm.getRawValue(),
      intent: this.credentialsForm.getRawValue().intent,
      email: this.credentialsForm.getRawValue().email,
      password: this.credentialsForm.getRawValue().password,
      confirmPassword: this.credentialsForm.getRawValue().confirmPassword
    };

    this.submitted.emit(payload);
  }

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  protected passwordMismatch(): boolean {
    const raw = this.credentialsForm.getRawValue();
    return hasPasswordMismatch(raw.password, raw.confirmPassword);
  }

  protected fieldError(scope: 'company' | 'credentials', field: string): string {
    const control =
      scope === 'company'
        ? this.companyForm.controls[field as keyof typeof this.companyForm.controls]
        : this.credentialsForm.controls[field as keyof typeof this.credentialsForm.controls];

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.required;
    }

    if (control.hasError('email')) {
      return this.messages.invalidEmail;
    }

    if (field === 'ruc' && control.hasError('pattern')) {
      return this.messages.invalidRuc;
    }

    return this.messages.required;
  }
}
