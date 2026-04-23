import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { UserRole } from '../../../core/models/app.models';
import { SessionStorageService } from '../../../core/services/session-storage.service';
import { LoginPayload, RegisterPayload } from '../models/auth.models';
import { MockAuthService } from './mock-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(MockAuthService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly session = this.sessionStorage.session;
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());
  readonly permissions = computed(() => this.session()?.permissions ?? []);

  login(payload: LoginPayload): void {
    this.isLoading.set(true);
    this.authService
      .login(payload)
      .pipe(
        tap((session) => {
          this.sessionStorage.set(session);
          if (!payload.rememberMe) {
            sessionStorage.setItem('volatile.session', JSON.stringify(session));
          }
        })
      )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          void this.router.navigateByUrl(APP_ROUTES.dashboard);
        },
        error: () => this.isLoading.set(false)
      });
  }

  register(payload: RegisterPayload): void {
    this.isLoading.set(true);
    this.authService.register(payload).subscribe({
      next: (session) => {
        this.sessionStorage.set(session);
        this.isLoading.set(false);
        void this.router.navigateByUrl(APP_ROUTES.dashboard);
      },
      error: () => this.isLoading.set(false)
    });
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const userRole = this.user()?.role;
    return !!userRole && roles.includes(userRole);
  }

  logout(): void {
    this.sessionStorage.clear();
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
}
