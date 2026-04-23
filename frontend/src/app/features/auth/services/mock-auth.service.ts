import { delay, Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { AuthSession } from '../../../core/models/app.models';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { MOCK_SESSION } from '../../../../assets/mocks/auth.mock';
import { LoginPayload, RegisterPayload } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly latency = inject(APP_LATENCY_MS);

  login(payload: LoginPayload): Observable<AuthSession> {
    const session: AuthSession = {
      ...MOCK_SESSION,
      user: {
        ...MOCK_SESSION.user,
        email: payload.email
      }
    };

    return of(session).pipe(delay(this.latency));
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    const session: AuthSession = {
      ...MOCK_SESSION,
      user: {
        ...MOCK_SESSION.user,
        fullName: payload.fullName,
        email: payload.email,
        role: payload.role,
        profileType: payload.profileType
      }
    };

    return of(session).pipe(delay(this.latency));
  }
}
