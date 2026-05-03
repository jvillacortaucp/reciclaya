import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideArrowRight,
  LucideBuilding2,
  LucideCheckCircle,
  LucideEye,
  LucideEyeOff,
  LucideMapPin,
  LucidePhone,
  LucideShieldCheck,
  LucideUser,
  LucideZap
} from '@lucide/angular';
import { UserRole } from '../../../../../core/models/app.models';
import {
  INPUT_PATTERNS,
  passwordStrengthValidator,
  phoneValidator,
  postalCodeValidator,
  safeAddressValidator,
  safeBusinessNameValidator,
  safeJobTitleValidator,
  safePersonNameValidator,
  sanitizeDigits,
  sanitizeInputValue
} from '../../../../../shared/helpers/validators';
import { COMPANY_REGISTER_STEPS, INTENT_OPTIONS, REGISTER_PAGE_COPY, REGISTER_VALIDATION_MESSAGES } from '../../../data/register.constants';
import { AccountType, CompanyRegistrationPayload, RegistrationIntent } from '../../../domain/register.models';
import { hasPasswordMismatch } from '../../helpers/register-form.helpers';

@Component({
  selector: 'app-company-register-form',
  imports: [
    ReactiveFormsModule,
    LucideEye,
    LucideEyeOff,
    LucideBuilding2,
    LucidePhone,
    LucideMapPin,
    LucideUser,
    LucideArrowRight,
    LucideZap,
    LucideShieldCheck,
    LucideCheckCircle
  ],
  templateUrl: './company-register-form.component.html',
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
    businessName: ['', [Validators.required, Validators.maxLength(120), safeBusinessNameValidator]],
    mobilePhone: ['', [Validators.required, phoneValidator]],
    address: ['', [Validators.required, Validators.maxLength(180), safeAddressValidator]],
    postalCode: ['', [Validators.required, postalCodeValidator]],
    legalRepresentative: ['', [Validators.required, Validators.maxLength(120), safePersonNameValidator]],
    position: ['', [Validators.required, Validators.maxLength(80), safeJobTitleValidator]]
  });

  protected readonly credentialsForm = this.fb.nonNullable.group({
    intent: [RegistrationIntent.Both, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
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

    if (field === 'mobilePhone' && control.hasError('invalidPhone')) {
      return this.messages.invalidPhone;
    }

    if (field === 'postalCode' && control.hasError('invalidPostalCode')) {
      return this.messages.invalidPostalCode;
    }

    if (field === 'businessName' && control.hasError('invalidBusinessName')) {
      return this.messages.invalidBusinessName;
    }

    if (field === 'address' && control.hasError('invalidAddress')) {
      return this.messages.invalidAddress;
    }

    if (field === 'legalRepresentative' && (control.hasError('invalidName') || control.hasError('notMeaningful'))) {
      return this.messages.invalidName;
    }

    if (field === 'position' && (control.hasError('invalidJobTitle') || control.hasError('notMeaningful'))) {
      return this.messages.invalidJobTitle;
    }

    if (control.hasError('suspiciousContent')) {
      return this.messages.suspiciousContent;
    }

    if (field === 'password' && control.hasError('passwordStrength')) {
      return this.messages.invalidPassword;
    }

    if (control.hasError('maxlength')) {
      return `Maximo ${control.getError('maxlength').requiredLength} caracteres.`;
    }

    return this.messages.notMeaningful;
  }

  protected sanitizeCompanyField(
    field: 'businessName' | 'address' | 'legalRepresentative' | 'position',
    mode: 'businessName' | 'address' | 'personName' | 'jobTitle'
  ): void {
    const control = this.companyForm.controls[field];
    const nextValue = sanitizeInputValue(control.value, mode);
    if (control.value !== nextValue) {
      control.setValue(nextValue);
    }
  }

  protected sanitizeDigitsField(field: 'ruc' | 'mobilePhone' | 'postalCode'): void {
    const control = this.companyForm.controls[field];
    const nextValue = sanitizeDigits(control.value, { allowLeadingPlus: field === 'mobilePhone' });
    if (control.value !== nextValue) {
      control.setValue(nextValue);
    }
  }

  protected readonly rucPattern = INPUT_PATTERNS.numericOnly.source;
  protected readonly postalCodePattern = INPUT_PATTERNS.numericOnly.source;
}
