import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { UserRole } from '../../../../../core/models/app.models';
import {
  documentNumberValidator,
  passwordStrengthValidator,
  phoneValidator,
  postalCodeValidator,
  safeAddressValidator,
  safePersonNameValidator,
  sanitizeDigits,
  sanitizeInputValue
} from '../../../../../shared/helpers/validators';
import { INTENT_OPTIONS, REGISTER_PAGE_COPY, REGISTER_VALIDATION_MESSAGES } from '../../../data/register.constants';
import { AccountType, NaturalPersonRegistrationPayload, RegistrationIntent } from '../../../domain/register.models';
import { hasPasswordMismatch } from '../../helpers/register-form.helpers';

@Component({
  selector: 'app-natural-person-register-form',
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff],
  templateUrl: './natural-person-register-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NaturalPersonRegisterFormComponent {
  private readonly fb = new FormBuilder();

  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Output() readonly submitted = new EventEmitter<NaturalPersonRegistrationPayload>();

  protected readonly copy = REGISTER_PAGE_COPY;
  protected readonly intents = INTENT_OPTIONS;
  protected readonly messages = REGISTER_VALIDATION_MESSAGES;

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80), safePersonNameValidator]],
    lastName: ['', [Validators.required, Validators.maxLength(80), safePersonNameValidator]],
    documentNumber: ['', [Validators.required, documentNumberValidator]],
    mobilePhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    address: ['', [Validators.required, Validators.maxLength(180), safeAddressValidator]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
    intent: [RegistrationIntent.Both, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]]
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.passwordMismatch()) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: NaturalPersonRegistrationPayload = {
      accountType: AccountType.NaturalPerson,
      role: UserRole.Buyer,
      firstName: raw.firstName,
      lastName: raw.lastName,
      documentNumber: raw.documentNumber,
      mobilePhone: raw.mobilePhone,
      address: raw.address,
      postalCode: raw.postalCode,
      intent: raw.intent,
      email: raw.email,
      password: raw.password,
      confirmPassword: raw.confirmPassword
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
    const raw = this.form.getRawValue();
    return hasPasswordMismatch(raw.password, raw.confirmPassword);
  }

  protected fieldError(field: string): string {
    const control = this.form.controls[field as keyof typeof this.form.controls];
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.required;
    }

    if (control.hasError('email')) {
      return this.messages.invalidEmail;
    }

    if (field === 'documentNumber' && control.hasError('pattern')) {
      return this.messages.invalidDocument;
    }

    if (field === 'documentNumber' && control.hasError('invalidDocument')) {
      return this.messages.invalidDocument;
    }

    if (field === 'mobilePhone' && control.hasError('invalidPhone')) {
      return this.messages.invalidPhone;
    }

    if (field === 'postalCode' && control.hasError('invalidPostalCode')) {
      return this.messages.invalidPostalCode;
    }

    if (field === 'address' && control.hasError('invalidAddress')) {
      return this.messages.invalidAddress;
    }

    if ((field === 'firstName' || field === 'lastName') && (control.hasError('invalidName') || control.hasError('notMeaningful'))) {
      return this.messages.invalidName;
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

  protected sanitizeName(field: 'firstName' | 'lastName'): void {
    const control = this.form.controls[field];
    const nextValue = sanitizeInputValue(control.value, 'personName');
    if (control.value !== nextValue) {
      control.setValue(nextValue);
    }
  }

  protected sanitizeAddress(): void {
    const control = this.form.controls.address;
    const nextValue = sanitizeInputValue(control.value, 'address');
    if (control.value !== nextValue) {
      control.setValue(nextValue);
    }
  }

  protected sanitizeDigitsField(field: 'documentNumber' | 'mobilePhone' | 'postalCode'): void {
    const control = this.form.controls[field];
    const nextValue = sanitizeDigits(control.value, { allowLeadingPlus: field === 'mobilePhone' });
    if (control.value !== nextValue) {
      control.setValue(nextValue);
    }
  }
}
