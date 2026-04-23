import { UserRole } from '../../../core/models/app.models';

export interface LoginPayload {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface RegisterPayload {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly profileType: 'company' | 'person';
  readonly role: UserRole;
}
