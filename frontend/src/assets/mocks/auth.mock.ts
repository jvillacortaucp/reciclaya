import { AuthSession, UserRole } from '../../app/core/models/app.models';
import { PERMISSIONS } from '../../app/core/constants/app.constants';

export const MOCK_SESSION: AuthSession = {
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
  permissions: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PREFERENCES,
    PERMISSIONS.VIEW_MARKETPLACE,
    PERMISSIONS.CREATE_PRE_ORDER,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.MANAGE_PROFILE
  ]
};
