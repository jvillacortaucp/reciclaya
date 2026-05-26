import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideCheckCircle, LucideShieldCheck, LucideSparkles, LucideZap } from '@lucide/angular';
import { ACCOUNT_TYPE_OPTIONS, REGISTER_PAGE_COPY } from '../data/register.constants';
import {
  AccountType,
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload
} from '../domain/register.models';
import { AuthFacade } from '../services/auth.facade';
import { AuthTransitionService } from '../services/auth-transition.service';
import { AccountTypeSelectorComponent } from './components/account-type-selector/account-type-selector.component';
import { CompanyRegisterFormComponent } from './components/company-register-form/company-register-form.component';
import { NaturalPersonRegisterFormComponent } from './components/natural-person-register-form/natural-person-register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    LucideSparkles,
    LucideZap,
    LucideCheckCircle,
    LucideShieldCheck,
    AccountTypeSelectorComponent,
    CompanyRegisterFormComponent,
    NaturalPersonRegisterFormComponent
  ],
  templateUrl: './register.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly authTransition = inject(AuthTransitionService);

  protected readonly copy = REGISTER_PAGE_COPY;
  protected readonly accountType = AccountType;
  protected readonly accountTypeOptions = ACCOUNT_TYPE_OPTIONS;
  protected readonly loading = this.authFacade.isLoading;
  protected readonly authError = this.authFacade.authError;
  protected readonly isTransitioning = this.authTransition.isPlaying;
  protected readonly reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  protected readonly selectedAccountType = signal<AccountType>(AccountType.Company);
  protected readonly selectedAccountTypeDescription = computed(
    () =>
      this.accountTypeOptions.find((item) => item.value === this.selectedAccountType())?.description ?? ''
  );

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

  protected onAccountTypeChange(type: AccountType): void {
    this.authFacade.clearError();
    this.selectedAccountType.set(type);
  }

  protected submitCompany(payload: CompanyRegistrationPayload): void {
    this.authFacade.registerCompany(payload);
  }

  protected submitNaturalPerson(payload: NaturalPersonRegistrationPayload): void {
    this.authFacade.registerNaturalPerson(payload);
  }

  public now = new Date().getFullYear();
}
