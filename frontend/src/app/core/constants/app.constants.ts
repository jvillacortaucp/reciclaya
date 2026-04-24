export const APP_NAME = 'ReciclaYa';

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  MANAGE_WASTE: 'manage:waste',
  MANAGE_PREFERENCES: 'manage:preferences',
  VIEW_MY_LISTINGS: 'view:my-listings',
  VIEW_REQUESTS: 'view:requests',
  VIEW_MESSAGES: 'view:messages',
  VIEW_MARKETPLACE: 'view:marketplace',
  CREATE_PRE_ORDER: 'create:preorder',
  VIEW_VALUE_SECTOR: 'view:value-sector',
  MANAGE_PROFILE: 'manage:profile'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const APP_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/app/dashboard',
  wasteSell: '/app/waste-sell',
  myListings: '/app/my-listings',
  requests: '/app/requests',
  valueSector: '/app/value-sector',
  messages: '/app/messages',
  preferences: '/app/purchase-preferences',
  marketplace: '/app/marketplace',
  preOrders: '/app/pre-orders',
  profile: '/app/profile',
  settings: '/app/settings'
} as const;
