import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { getErrorMessage } from '../../../core/http/api-response.helpers';
import { APP_ROUTES, PERMISSIONS } from '../../../core/constants/app.constants';
import { User, UserRole } from '../../../core/models/app.models';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { LOGIN_VALIDATION_MESSAGES } from '../data/login.constants';
import { LoginPayload } from '../domain/login-screen.models';
import {
  AccountType,
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload,
  RegisterPayload
} from '../domain/register.models';
import { AuthHttpRepository } from '../infrastructure/auth-http.repository';
import { MockAuthService } from './mock-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authRepository = inject(AuthHttpRepository);
  private readonly mockAuthService = inject(MockAuthService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly router = inject(Router);

  readonly emailLoginLoading = signal(false);
  readonly socialLoginLoading = signal(false);
  readonly authError = signal<string | null>(null);

  readonly session = this.sessionStorage.session;
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());
  readonly permissions = computed(() => this.session()?.permissions ?? []);
  readonly isLoading = computed(() => this.emailLoginLoading() || this.socialLoginLoading());

  login(payload: LoginPayload): void {
    this.authError.set(null);
    this.emailLoginLoading.set(true);

    this.authRepository
      .loginWithEmail(payload)
      .pipe(
        tap((session) => {
          this.persistSession(session, payload.rememberMe);
        }),
        catchError((error: unknown) => {
          this.authError.set(this.resolveLoginErrorMessage(error));
          return EMPTY;
        }),
        finalize(() => this.emailLoginLoading.set(false))
      )
      .subscribe(() => {
        void this.router.navigateByUrl(APP_ROUTES.dashboard);
      });
  }

  loginWithGoogle(): void {
    this.authError.set(null);
    this.socialLoginLoading.set(true);

    this.mockAuthService
      .loginWithGoogle()
      .pipe(
        tap((session) => this.persistSession(session, true)),
        catchError(() => {
          this.authError.set(LOGIN_VALIDATION_MESSAGES.socialDisabled);
          return EMPTY;
        }),
        finalize(() => this.socialLoginLoading.set(false))
      )
      .subscribe(() => {
        void this.router.navigateByUrl(APP_ROUTES.dashboard);
      });
  }

  register(payload: RegisterPayload): void {
    if (payload.accountType === AccountType.Company) {
      this.registerCompany(payload);
      return;
    }

    this.registerNaturalPerson(payload);
  }

  registerCompany(payload: CompanyRegistrationPayload): void {
    this.authError.set(null);
    this.emailLoginLoading.set(true);

    this.authRepository
      .registerCompany(payload)
      .pipe(finalize(() => this.emailLoginLoading.set(false)))
      .subscribe({
        next: (session) => {
          this.persistSession(session, true);
          void this.router.navigateByUrl(APP_ROUTES.dashboard);
        },
        error: (error: unknown) => this.authError.set(getErrorMessage(error, 'No se pudo completar el registro de empresa.'))
      });
  }

  registerNaturalPerson(payload: NaturalPersonRegistrationPayload): void {
    this.authError.set(null);
    this.emailLoginLoading.set(true);

    this.authRepository
      .registerNaturalPerson(payload)
      .pipe(finalize(() => this.emailLoginLoading.set(false)))
      .subscribe({
        next: (session) => {
          this.persistSession(session, true);
          void this.router.navigateByUrl(APP_ROUTES.dashboard);
        },
        error: (error: unknown) =>
          this.authError.set(getErrorMessage(error, 'No se pudo completar el registro de persona natural.'))
      });
  }

  clearError(): void {
    this.authError.set(null);
  }

  hasPermission(permission: string): boolean {
    if (this.permissions().includes(permission)) {
      return true;
    }

    return permission === PERMISSIONS.MANAGE_USERS && this.user()?.role === UserRole.Admin;
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const userRole = this.user()?.role;
    return !!userRole && roles.includes(userRole);
  }

  logout(): void {
    this.sessionStorage.clear();
    void this.router.navigateByUrl(APP_ROUTES.login);
  }

  setRole(role: UserRole): void {
    const session = this.session();
    if (!session) {
      return;
    }

    this.sessionStorage.set({
      ...session,
      user: {
        ...session.user,
        role
      }
    });
  }

  updateUser(user: NonNullable<ReturnType<typeof this.user>>): void {
    const session = this.session();
    if (!session) {
      return;
    }

    this.sessionStorage.set({
      ...session,
      user
    });
  }

  patchUser(patch: Partial<User>): void {
    const session = this.session();
    if (!session) {
      return;
    }

    this.sessionStorage.set({
      ...session,
      user: {
        ...session.user,
        ...patch
      }
    });
  }

  private persistSession(session: NonNullable<ReturnType<typeof this.session>>, rememberSession: boolean): void {
    this.sessionStorage.set(session);
    if (!rememberSession) {
      sessionStorage.setItem('volatile.session', JSON.stringify(session));
    }
  }

  private resolveLoginErrorMessage(error: unknown): string {
    return getErrorMessage(error, LOGIN_VALIDATION_MESSAGES.invalidCredentials);
  }
}
