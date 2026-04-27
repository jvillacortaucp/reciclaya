import { SidebarNavItem } from '../models/app.models';
import { APP_ROUTES, PERMISSIONS } from './app.constants';

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  {
    label: 'Dashboard',
    group: 'Marketplace',
    icon: 'layout-dashboard',
    route: APP_ROUTES.dashboard,
    permissions: [PERMISSIONS.VIEW_DASHBOARD]
  },
  {
    label: 'Registrar Residuo',
    group: 'Marketplace',
    icon: 'package-plus',
    route: APP_ROUTES.wasteSell,
    permissions: [PERMISSIONS.MANAGE_WASTE]
  },
  {
    label: 'Preferencias',
    group: 'Marketplace',
    icon: 'sliders-horizontal',
    route: APP_ROUTES.preferences,
    permissions: [PERMISSIONS.MANAGE_PREFERENCES]
  },
  {
    label: 'Marketplace',
    group: 'Marketplace',
    icon: 'store',
    route: APP_ROUTES.marketplace,
    permissions: [PERMISSIONS.VIEW_MARKETPLACE]
  },
  {
    label: 'My posts',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.myListings,
    permissions: [PERMISSIONS.VIEW_MY_LISTINGS]
  },
  {
    label: 'Pre-ordenes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.preOrders,
    permissions: [PERMISSIONS.CREATE_PREORDER]
  },
  {
    label: 'Ordenes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.orders
  },
  {
    label: 'Solicitudes',
    group: 'Marketplace',
    icon: 'sparkles',
    route: APP_ROUTES.requests,
    permissions: [PERMISSIONS.VIEW_REQUESTS]
  },
  {
    label: 'Sector de valor',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.valueSector,
    permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS]
  },
  {
    label: 'Recomendaciones',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.recommendations,
    permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS]
  },
  {
    label: 'Messages',
    group: 'Intelligence',
    icon: 'messages',
    route: APP_ROUTES.messages,
    permissions: [PERMISSIONS.VIEW_MESSAGES]
  },
  {
    label: 'Admin empresas',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.admin,
    permissions: [PERMISSIONS.MANAGE_USERS]
  },
  {
    label: 'Profile',
    group: 'Account',
    icon: 'circle-user-round',
    route: APP_ROUTES.profile,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  },
  {
    label: 'Settings',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.settings,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  }
];
