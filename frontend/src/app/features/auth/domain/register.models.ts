import { UserRole } from '../../../core/models/app.models';

export enum AccountType {
  Company = 'company',
  NaturalPerson = 'natural_person'
}

export enum RegistrationIntent {
  Sell = 'sell',
  Buy = 'buy',
  Recommendations = 'recommendations',
  Both = 'both'
}

export interface BaseRegistrationCredentials {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface CompanyRegistrationStepOne {
  readonly ruc: string;
  readonly businessName: string;
  readonly mobilePhone: string;
  readonly address: string;
  readonly postalCode: string;
  readonly legalRepresentative: string;
  readonly position: string;
}

export interface CompanyRegistrationPayload extends BaseRegistrationCredentials {
  readonly accountType: AccountType.Company;
  readonly intent: RegistrationIntent;
  readonly company: CompanyRegistrationStepOne;
  readonly role: UserRole;
}

export interface NaturalPersonRegistrationPayload extends BaseRegistrationCredentials {
  readonly accountType: AccountType.NaturalPerson;
  readonly firstName: string;
  readonly lastName: string;
  readonly documentNumber: string;
  readonly mobilePhone: string;
  readonly address: string;
  readonly postalCode: string;
  readonly intent: RegistrationIntent;
  readonly role: UserRole;
}

export type RegisterPayload = CompanyRegistrationPayload | NaturalPersonRegistrationPayload;

export interface AccountTypeOption {
  readonly value: AccountType;
  readonly title: string;
  readonly description: string;
  readonly icon: 'building-2' | 'user-round';
}

export interface IntentOption {
  readonly value: RegistrationIntent;
  readonly label: string;
  readonly helper: string;
}

export interface RegisterStepItem {
  readonly index: number;
  readonly title: string;
  readonly subtitle: string;
}
