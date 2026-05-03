export const APP_NAME = 'RevaloraIA';

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  VIEW_MARKETPLACE: 'view:marketplace',
  MANAGE_WASTE: 'manage:waste',
  MANAGE_PREFERENCES: 'manage:preferences',
  VIEW_MY_LISTINGS: 'view:my-listings',
  CREATE_PREORDER: 'create:preorder',
  VIEW_REQUESTS: 'view:requests',
  VIEW_MESSAGES: 'view:messages',
  CREATE_PRE_ORDER: 'create:preorder',
  VIEW_RECOMMENDATIONS: 'view:recommendations',
  VIEW_VALUE_SECTOR: 'view:value-sector',
  MANAGE_PROFILE: 'manage:profile',
  MANAGE_USERS: 'manage:users'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const APP_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/app/dashboard',
  marketplace: '/marketplace',
  wasteSell: '/app/waste-sell',
  myListings: '/app/my-listings',
  purchasePreferences: '/app/purchase-preferences',
  preferences: '/app/purchase-preferences',
  preOrders: '/app/pre-orders',
  assistantChat: '/assistant-chat',
  recommendations: '/app/recommendations',
  requests: '/app/requests',
  messages: '/app/messages',
  orders: '/app/orders',
  checkout: '/app/checkout',
  profile: '/app/profile',
  settings: '/app/settings',
  admin: '/app/admin',
  valueSector: '/app/value-sector'
} as const;
