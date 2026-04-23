import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { UserRole } from '../../../../../core/models/app.models';
import { INTENT_OPTIONS, REGISTER_PAGE_COPY, REGISTER_VALIDATION_MESSAGES } from '../../../data/register.constants';
import { AccountType, NaturalPersonRegistrationPayload, RegistrationIntent } from '../../../domain/register.models';
import { hasPasswordMismatch } from '../../helpers/register-form.helpers';

@Component({
  selector: 'app-natural-person-register-form',
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff],
  templateUrl: './natural-person-register-form.component.html',
  styleUrl: './natural-person-register-form.component.css',
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
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8,12}$/)]],
    mobilePhone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    intent: [RegistrationIntent.Both, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
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

    return this.messages.required;
  }
}
