import { computed, ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideChartNoAxesColumnIncreasing,
  LucideEye,
  LucideEyeOff,
  LucideLoaderCircle,
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
import { AuthTransitionService } from '../services/auth-transition.service';

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
    LucideLoaderCircle,
    LucideAlertCircle,
    LucideRecycle,
    LucideChartNoAxesColumnIncreasing,
    LucideTruck,
    LucideShieldCheck
  ],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly authTransition = inject(AuthTransitionService);

  protected readonly copy = LOGIN_SCREEN_COPY;
  protected readonly featureItems = LOGIN_FEATURE_ITEMS;
  protected readonly socialOptions = SOCIAL_AUTH_OPTIONS;
  protected readonly messages = LOGIN_VALIDATION_MESSAGES;

  protected readonly emailLoading = this.authFacade.emailLoginLoading;
  protected readonly socialLoading = this.authFacade.socialLoginLoading;
  protected readonly authError = this.authFacade.authError;
  protected readonly isTransitioning = this.authTransition.isPlaying;

  protected readonly showPassword = signal(false);
  protected readonly reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true]
  });

  protected readonly googleOption = computed(() =>
    this.socialOptions.find((option) => option.provider === AuthProvider.Google) ?? null
  );

  protected readonly hasSocialOptions = computed(() => this.socialOptions.some((option) => option.enabled));

  constructor() {
    effect(() => {
      const targetUrl = this.authFacade.authSuccessTargetUrl();
      if (!targetUrl) {
        return;
      }

      const target = this.authFacade.consumeAuthSuccessTargetUrl();
      if (!target) {
        return;
      }

      if (this.reduceMotion) {
        void this.router.navigateByUrl(target);
        return;
      }

      this.authTransition.startPrepared(target);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.authTransition.startOpening();
        });
      });

      setTimeout(() => {
        this.authTransition.markNavigating();
        void this.router.navigateByUrl(target).catch(() => {
          this.authTransition.reset();
        });
      }, this.authTransition.NAVIGATION_TRIGGER_MS);
    });
  }

  ngOnInit(): void {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const authStatus = typeof queryParams['auth'] === 'string' ? queryParams['auth'] : null;
    const errorCode = typeof queryParams['code'] === 'string' ? queryParams['code'] : null;
    const ticket = typeof queryParams['ticket'] === 'string' ? queryParams['ticket'] : null;

    if (authStatus === 'success' || authStatus === 'error') {
      this.authFacade.processGoogleCallback(ticket, authStatus, errorCode);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected submit(): void {
    if (this.emailLoading() || this.socialLoading() || this.isTransitioning()) {
      return;
    }

    this.authFacade.clearError();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authFacade.login(this.form.getRawValue());
  }

  protected continueWithGoogle(): void {
    if (!this.googleOption()?.enabled || this.isTransitioning()) {
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
