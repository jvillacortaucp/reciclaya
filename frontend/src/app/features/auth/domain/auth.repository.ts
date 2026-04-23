import { Observable } from 'rxjs';
import { AuthSession } from '../../../core/models/app.models';
import { LoginPayload } from './login-screen.models';
import {
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload,
  RegisterPayload
} from './register.models';

export interface AuthRepository {
  loginWithEmail(payload: LoginPayload): Observable<AuthSession>;
  loginWithGoogle(): Observable<AuthSession>;
  registerCompany(payload: CompanyRegistrationPayload): Observable<AuthSession>;
  registerNaturalPerson(payload: NaturalPersonRegistrationPayload): Observable<AuthSession>;
  register(payload: RegisterPayload): Observable<AuthSession>;
}
