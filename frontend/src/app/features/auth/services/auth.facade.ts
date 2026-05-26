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

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authRepository = inject(AuthHttpRepository);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly router = inject(Router);

  readonly emailLoginLoading = signal(false);
  readonly socialLoginLoading = signal(false);
  readonly authError = signal<string | null>(null);
  readonly authSuccessTargetUrl = signal<string | null>(null);

  readonly session = this.sessionStorage.session;
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());
  readonly permissions = computed(() => this.session()?.permissions ?? []);
  readonly isLoading = computed(() => this.emailLoginLoading() || this.socialLoginLoading());
  private syncRequested = false;

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
        this.queueNavigationAfterAuth();
      });
  }

  loginWithGoogle(): void {
    if (this.socialLoginLoading() || this.emailLoginLoading()) {
      return;
    }

    this.authError.set(null);
    this.socialLoginLoading.set(true);

    const returnUrl = this.extractReturnUrl() ?? APP_ROUTES.dashboard;
    const url = this.authRepository.buildGoogleStartUrl(returnUrl);
    window.location.assign(url);
  }

  processGoogleCallback(ticket: string | null, authStatus: string | null, errorCode: string | null): void {
    if (authStatus !== 'success' || !ticket) {
      if (authStatus === 'error') {
        this.authError.set(this.mapGoogleError(errorCode));
      }
      this.socialLoginLoading.set(false);
      return;
    }

    this.authError.set(null);
    this.socialLoginLoading.set(true);

    this.authRepository
      .exchangeGoogleSession(ticket)
      .pipe(
        tap((session) => {
          this.persistSession(session, true);
        }),
        catchError((error: unknown) => {
          this.authError.set(getErrorMessage(error, 'No se pudo completar la sesion con Google.'));
          return EMPTY;
        }),
        finalize(() => this.socialLoginLoading.set(false))
      )
      .subscribe(() => {
        this.queueNavigationAfterAuth();
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
          this.queueNavigationAfterAuth();
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
          this.queueNavigationAfterAuth();
        },
        error: (error: unknown) =>
          this.authError.set(getErrorMessage(error, 'No se pudo completar el registro de persona natural.'))
      });
  }

  clearError(): void {
    this.authError.set(null);
  }

  hasPermission(permission: string): boolean {
    if (this.user()?.role === UserRole.Admin) {
      return true;
    }

    const normalize = (s: string) => s.trim().toLowerCase();
    const perms = this.permissions().map((p) => normalize(p));
    if (perms.includes(normalize(permission))) {
      return true;
    }

    return normalize(permission) === normalize(PERMISSIONS.MANAGE_USERS) && this.user()?.role === UserRole.Admin;
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const userRole = this.user()?.role;
    return !!userRole && roles.includes(userRole);
  }

  syncSession(force = false): void {
    const current = this.session();
    if (!current?.token) {
      return;
    }

    if (this.syncRequested && !force) {
      return;
    }

    this.syncRequested = true;
    this.authRepository.getMe().subscribe({
      next: (me) => {
        const existing = this.session();
        if (!existing) {
          return;
        }

        this.sessionStorage.set({
          ...existing,
          user: {
            ...existing.user,
            ...me.user,
            avatarUrl: me.user.avatarUrl ?? existing.user.avatarUrl ?? null
          },
          permissions: me.permissions
        });
      },
      error: () => {
        this.syncRequested = false;
      }
    });
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

  consumeAuthSuccessTargetUrl(): string | null {
    const url = this.authSuccessTargetUrl();
    this.authSuccessTargetUrl.set(null);
    return url;
  }

  private queueNavigationAfterAuth(): void {
    const returnUrl = this.extractReturnUrl();
    this.authSuccessTargetUrl.set(returnUrl ?? APP_ROUTES.dashboard);
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.extractReturnUrl();
    void this.router.navigateByUrl(returnUrl ?? APP_ROUTES.dashboard);
  }

  private mapGoogleError(errorCode: string | null): string {
    if (!errorCode) {
      return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    }

    switch (errorCode) {
      case 'INVALID_OAUTH_STATE':
        return 'La sesion de Google expiro. Intenta nuevamente.';
      case 'GOOGLE_EMAIL_NOT_VERIFIED':
        return 'Tu correo de Google no esta verificado.';
      case 'GOOGLE_PROFILE_INCOMPLETE':
        return 'Google no devolvio un perfil completo.';
      case 'GOOGLE_OAUTH_FAILED':
        return 'Fallo la autenticacion con Google. Reintenta en unos minutos.';
      case 'ACCESS_DENIED':
        return 'Acceso denegado. No se concedieron los permisos necesarios.';
      case 'SOCIAL_DISABLED':
        return LOGIN_VALIDATION_MESSAGES.socialDisabled;
      default:
        return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    }
  }

  private extractReturnUrl(): string | null {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    const returnUrl = queryParams['returnUrl'];

    if (typeof returnUrl !== 'string' || !returnUrl.startsWith('/')) {
      return null;
    }

    if (returnUrl.startsWith('/auth')) {
      return null;
    }

    return returnUrl;
  }
}
