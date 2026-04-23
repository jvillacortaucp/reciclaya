import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSparkles } from '@lucide/angular';
import { ACCOUNT_TYPE_OPTIONS, REGISTER_PAGE_COPY } from '../data/register.constants';
import {
  AccountType,
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload
} from '../domain/register.models';
import { AuthFacade } from '../services/auth.facade';
import { AccountTypeSelectorComponent } from './components/account-type-selector/account-type-selector.component';
import { CompanyRegisterFormComponent } from './components/company-register-form/company-register-form.component';
import { NaturalPersonRegisterFormComponent } from './components/natural-person-register-form/natural-person-register-form.component';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    LucideSparkles,
    AccountTypeSelectorComponent,
    CompanyRegisterFormComponent,
    NaturalPersonRegisterFormComponent
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly copy = REGISTER_PAGE_COPY;
  protected readonly accountType = AccountType;
  protected readonly accountTypeOptions = ACCOUNT_TYPE_OPTIONS;
  protected readonly loading = this.authFacade.isLoading;
  protected readonly authError = this.authFacade.authError;

  protected readonly selectedAccountType = signal<AccountType>(AccountType.Company);
  protected readonly selectedAccountTypeDescription = computed(
    () =>
      this.accountTypeOptions.find((item) => item.value === this.selectedAccountType())?.description ?? ''
  );

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
}
