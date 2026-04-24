import { APP_ROUTES, PERMISSIONS } from '../../../constants/app.constants';
import { SidebarNavItem } from '../models/sidebar-nav-item.model';

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  {
    label: 'Dashboard',
    group: 'General',
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
    label: 'Mis publicaciones',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.myListings,
    permissions: [PERMISSIONS.VIEW_MY_LISTINGS]
  },
  {
    label: 'Matches',
    group: 'Marketplace',
    icon: 'sparkles',
    route: APP_ROUTES.requests,
    permissions: [PERMISSIONS.VIEW_REQUESTS]
  },
  {
    label: 'Mensajes',
    group: 'Intelligence',
    icon: 'messages',
    route: APP_ROUTES.messages,
    permissions: [PERMISSIONS.VIEW_MESSAGES]
  },
  {
    label: 'Perfil',
    group: 'Account',
    icon: 'circle-user-round',
    route: APP_ROUTES.profile,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  },
  {
    label: 'Configuración',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.settings,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  }
];
