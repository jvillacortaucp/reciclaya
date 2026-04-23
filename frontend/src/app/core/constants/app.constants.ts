export const APP_NAME = 'ReciclaYa';

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  MANAGE_WASTE: 'manage:waste',
  MANAGE_PREFERENCES: 'manage:preferences',
  VIEW_MARKETPLACE: 'view:marketplace',
  CREATE_PRE_ORDER: 'create:preorder',
  VIEW_RECOMMENDATIONS: 'view:recommendations',
  MANAGE_PROFILE: 'manage:profile'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const APP_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/app/dashboard',
  wasteSell: '/app/waste-sell',
  preferences: '/app/purchase-preferences',
  marketplace: '/app/marketplace',
  preOrders: '/app/pre-orders',
  recommendations: '/app/recommendations',
  profile: '/app/profile',
  settings: '/app/settings'
} as const;
