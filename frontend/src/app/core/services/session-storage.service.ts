import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSession } from '../models/app.models';
import { APP_ROUTES } from '../constants/app.constants';

const SESSION_KEY = 'reciclaya.session';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  readonly session = signal<AuthSession | null>(this.read());
  private readonly router = inject(Router);

  set(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
    this.session.set(null);
    void this.router.navigateByUrl(APP_ROUTES.login);
  }

  private read(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}
