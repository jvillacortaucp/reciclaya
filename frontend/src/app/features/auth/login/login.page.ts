import { computed, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideChartNoAxesColumnIncreasing,
  LucideEye,
  LucideEyeOff,
  LucideLockKeyhole,
  LucideMail,
  LucideRecycle,
  LucideShieldCheck,
  LucideTruck
} from '@lucide/angular';
import {
  LOGIN_FEATURE_ITEMS,
  LOGIN_SCREEN_COPY,
  LOGIN_VALIDATION_MESSAGES,
  SOCIAL_AUTH_OPTIONS
} from '../data/login.constants';
import { AuthProvider } from '../domain/login-screen.models';
import { AuthFacade } from '../services/auth.facade';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideMail,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideArrowRight,
    LucideRecycle,
    LucideChartNoAxesColumnIncreasing,
    LucideTruck,
    LucideShieldCheck
  ],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);

  protected readonly copy = LOGIN_SCREEN_COPY;
  protected readonly featureItems = LOGIN_FEATURE_ITEMS;
  protected readonly socialOptions = SOCIAL_AUTH_OPTIONS;
  protected readonly messages = LOGIN_VALIDATION_MESSAGES;

  protected readonly emailLoading = this.authFacade.emailLoginLoading;
  protected readonly socialLoading = this.authFacade.socialLoginLoading;
  protected readonly authError = this.authFacade.authError;

  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true]
  });

  protected readonly googleOption = computed(() =>
    this.socialOptions.find((option) => option.provider === AuthProvider.Google) ?? null
  );

  protected readonly hasSocialOptions = computed(() => this.socialOptions.some((option) => option.enabled));

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected submit(): void {
    this.authFacade.clearError();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authFacade.login(this.form.getRawValue());
  }

  protected continueWithGoogle(): void {
    if (!this.googleOption()?.enabled) {
      return;
    }

    this.authFacade.loginWithGoogle();
  }

  protected emailError(): string {
    const control = this.form.controls.email;
    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.requiredEmail;
    }

    if (control.hasError('email')) {
      return this.messages.invalidEmail;
    }

    return '';
  }

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return this.messages.requiredPassword;
    }

    return '';
  }
}
