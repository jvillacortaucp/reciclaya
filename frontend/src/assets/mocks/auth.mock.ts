import { Permission } from '../../app/core/constants/app.constants';
import { AuthSession, UserRole } from '../../app/core/models/app.models';

export interface MockAuthUserRecord {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly profileType: 'company' | 'person';
  readonly permissions: readonly Permission[];
}

export const MOCK_DEFAULT_SESSION: AuthSession = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: '2026-12-31T23:59:59.000Z',
  user: {
    id: 'usr-001',
    email: 'compras@ecopartner.pe',
    fullName: 'Camila Rojas',
    role: UserRole.Buyer,
    profileType: 'company'
  },
  permissions: []
};

export const MOCK_AUTH_USERS: readonly MockAuthUserRecord[] = [
  {
    id: 'usr-001',
    email: 'compras@ecopartner.pe',
    password: 'ReciclaYa2026',
    fullName: 'Camila Rojas',
    role: UserRole.Buyer,
    profileType: 'company',
    permissions: [
      'view:dashboard',
      'manage:preferences',
      'view:marketplace',
      'view:my-listings',
      'view:requests',
      'create:preorder',
      'view:recommendations',
      'view:value-sector',
      'view:messages',
      'manage:profile'
    ]
  },
  {
    id: 'usr-002',
    email: 'ventas@agroloop.pe',
    password: 'ReciclaYa2026',
    fullName: 'Diego Salazar',
    role: UserRole.Seller,
    profileType: 'company',
    permissions: [
      'view:dashboard',
      'manage:waste',
      'manage:preferences',
      'view:my-listings',
      'view:requests',
      'view:marketplace',
      'create:preorder',
      'view:messages',
      'view:recommendations',
      'view:value-sector',
      'manage:profile',
    ]
  }
];

export const MOCK_GOOGLE_PROFILE = {
  email: 'compras@ecopartner.pe',
  displayName: 'Camila Rojas'
} as const;
