import { APP_ROUTES, PERMISSIONS } from '../../../constants/app.constants';
import { SidebarNavItem } from '../models/sidebar-nav-item.model';

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  {
    label: 'Dashboard',
    group: 'General',
    icon: 'layout-dashboard',
    route: APP_ROUTES.dashboard,
    exact: true,
    permissions: [PERMISSIONS.VIEW_DASHBOARD]
  },
  {
    label: 'Registrar Residuo',
    group: 'Marketplace',
    icon: 'package-plus',
    route: APP_ROUTES.wasteSell,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_WASTE]
  },
  {
    label: 'Preferencias',
    group: 'Marketplace',
    icon: 'sliders-horizontal',
    route: APP_ROUTES.preferences,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PREFERENCES]
  },
  {
    label: 'Marketplace',
    group: 'Marketplace',
    icon: 'store',
    route: APP_ROUTES.marketplace,
    activePaths: [APP_ROUTES.marketplace],
    exact: false,
    permissions: [PERMISSIONS.VIEW_MARKETPLACE]
  },
  {
    label: 'Mis publicaciones',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.myListings,
    exact: true,
    permissions: [PERMISSIONS.VIEW_MY_LISTINGS]
  },
  {
    label: 'Matches',
    group: 'Marketplace',
    icon: 'sparkles',
    route: APP_ROUTES.requests,
    exact: true,
    permissions: [PERMISSIONS.VIEW_REQUESTS]
  },
  {
    label: 'Sector de valor',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.valueSector,
    exact: true,
    permissions: [PERMISSIONS.VIEW_VALUE_SECTOR]
  },
  {
    label: 'Mensajes',
    group: 'Intelligence',
    icon: 'messages',
    route: APP_ROUTES.messages,
    exact: true,
    permissions: [PERMISSIONS.VIEW_MESSAGES]
  },
  {
    label: 'Perfil',
    group: 'Account',
    icon: 'circle-user-round',
    route: APP_ROUTES.profile,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  },
  {
    label: 'Configuración',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.settings,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  }
];
