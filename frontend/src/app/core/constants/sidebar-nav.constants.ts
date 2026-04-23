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
    label: 'Publicar Residuo',
    group: 'Marketplace',
    icon: 'package-plus',
    route: APP_ROUTES.wasteSell,
    permissions: [PERMISSIONS.MANAGE_WASTE]
  },
  {
    label: 'Marketplace',
    group: 'Marketplace',
    icon: 'store',
    route: APP_ROUTES.marketplace,
    permissions: [PERMISSIONS.VIEW_MARKETPLACE]
  },
  {
    label: 'Pre-ordenes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.preOrders,
    permissions: [PERMISSIONS.CREATE_PRE_ORDER]
  },
  {
    label: 'Preferencias',
    group: 'Intelligence',
    icon: 'sliders-horizontal',
    route: APP_ROUTES.preferences,
    permissions: [PERMISSIONS.MANAGE_PREFERENCES]
  },
  {
    label: 'Recomendaciones',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.recommendations,
    permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS]
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
