import { User } from '../../core/models/app.models';

export interface ProfileCompany {
  readonly id: string;
  readonly ruc: string;
  readonly businessName: string;
  readonly logoUrl?: string | null;
  readonly mobilePhone: string;
  readonly address: string;
  readonly postalCode: string;
  readonly legalRepresentative: string;
  readonly position: string;
  readonly verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface ProfilePerson {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly documentNumber: string;
  readonly mobilePhone: string;
  readonly address: string;
  readonly postalCode: string;
  readonly verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Profile {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: User['role'];
  readonly profileType: User['profileType'];
  readonly status: string;
  readonly avatarUrl?: string | null;
  readonly company: ProfileCompany | null;
  readonly personProfile: ProfilePerson | null;
}

export interface UpdateProfilePayload {
  readonly fullName?: string;
  readonly mobilePhone?: string;
  readonly address?: string;
  readonly postalCode?: string;
  readonly company?: {
    readonly businessName?: string;
    readonly mobilePhone?: string;
    readonly address?: string;
    readonly postalCode?: string;
    readonly legalRepresentative?: string;
    readonly position?: string;
  };
  readonly personProfile?: {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly mobilePhone?: string;
    readonly address?: string;
    readonly postalCode?: string;
  };
}
