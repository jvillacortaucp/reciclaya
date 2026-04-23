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
    label: 'Registrar residuo',
    group: 'Marketplace',
    icon: 'package-plus',
    route: APP_ROUTES.wasteSell,
    permissions: [PERMISSIONS.MANAGE_WASTE]
  },
  {
    label: 'Mis publicaciones',
    group: 'Marketplace',
    icon: 'store',
    route: APP_ROUTES.myListings,
    permissions: [PERMISSIONS.VIEW_MY_LISTINGS]
  },
  {
    label: 'Solicitudes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.requests,
    permissions: [PERMISSIONS.VIEW_REQUESTS]
  },
  {
    label: 'Recomendaciones',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.recommendations,
    permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS]
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
    label: 'Ajustes',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.settings,
    permissions: [PERMISSIONS.MANAGE_PROFILE]
  }
];
