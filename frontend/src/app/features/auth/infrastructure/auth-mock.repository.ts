import { inject, Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthSession } from '../../../core/models/app.models';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import {
  MOCK_AUTH_USERS,
  MOCK_DEFAULT_SESSION,
  MOCK_GOOGLE_PROFILE,
  type MockAuthUserRecord
} from '../../../../assets/mocks/auth.mock';
import { AuthRepository } from '../domain/auth.repository';
import { LoginPayload } from '../domain/login-screen.models';
import {
  AccountType,
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload,
  RegisterPayload
} from '../domain/register.models';

@Injectable({ providedIn: 'root' })
export class AuthMockRepository implements AuthRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  loginWithEmail(payload: LoginPayload): Observable<AuthSession> {
    const matchedUser = MOCK_AUTH_USERS.find((user) => user.email === payload.email);
    if (!matchedUser || matchedUser.password !== payload.password) {
      return throwError(() => new Error('INVALID_CREDENTIALS')).pipe(delay(this.latency));
    }

    return of(this.toSession(matchedUser)).pipe(delay(this.latency));
  }

  loginWithGoogle(): Observable<AuthSession> {
    const matchedUser = MOCK_AUTH_USERS.find((user) => user.email === MOCK_GOOGLE_PROFILE.email);
    const fallback = matchedUser ?? MOCK_AUTH_USERS[0];
    return of(this.toSession(fallback)).pipe(delay(this.latency + 150));
  }

  registerCompany(payload: CompanyRegistrationPayload): Observable<AuthSession> {
    const syntheticUser: MockAuthUserRecord = {
      ...MOCK_AUTH_USERS[0],
      email: payload.email,
      password: payload.password,
      fullName: payload.company.legalRepresentative,
      role: payload.role,
      profileType: 'company'
    };

    return of(this.toSession(syntheticUser)).pipe(delay(this.latency));
  }

  registerNaturalPerson(payload: NaturalPersonRegistrationPayload): Observable<AuthSession> {
    const syntheticUser: MockAuthUserRecord = {
      ...MOCK_AUTH_USERS[0],
      email: payload.email,
      password: payload.password,
      fullName: `${payload.firstName} ${payload.lastName}`,
      role: payload.role,
      profileType: 'person'
    };

    return of(this.toSession(syntheticUser)).pipe(delay(this.latency));
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    if (payload.accountType === AccountType.Company) {
      return this.registerCompany(payload);
    }

    return this.registerNaturalPerson(payload);
  }

  private toSession(source: MockAuthUserRecord): AuthSession {
    return {
      ...MOCK_DEFAULT_SESSION,
      user: {
        id: source.id,
        email: source.email,
        fullName: source.fullName,
        role: source.role,
        profileType: source.profileType
      },
      permissions: source.permissions
    };
  }
}
