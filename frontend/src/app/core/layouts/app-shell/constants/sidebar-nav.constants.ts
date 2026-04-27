import { APP_ROUTES, PERMISSIONS } from '../../../constants/app.constants';
import { SidebarNavItem } from '../models/sidebar-nav-item.model';

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  {
    label: 'Dashboard',
    group: 'General',
    icon: 'layout-dashboard',
    route: APP_ROUTES.dashboard,
    exact: true,
    permissions: [PERMISSIONS.VIEW_DASHBOARD],
    roles: ['seller', 'buyer', 'admin']
  },
  {
    label: 'Publicar residuo',
    group: 'Marketplace',
    icon: 'package-plus',
    route: APP_ROUTES.wasteSell,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_WASTE],
    roles: ['seller']
  },
  {
    label: 'Preferencias de compra',
    group: 'Marketplace',
    icon: 'sliders-horizontal',
    route: APP_ROUTES.preferences,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PREFERENCES],
    roles: ['buyer']
  },
  {
    label: 'Marketplace',
    group: 'Marketplace',
    icon: 'store',
    route: APP_ROUTES.marketplace,
    activePaths: [APP_ROUTES.marketplace],
    exact: false,
    permissions: [PERMISSIONS.VIEW_MARKETPLACE],
    roles: ['seller', 'buyer', 'admin']
  },
  {
    label: 'Mis publicaciones',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.myListings,
    exact: true,
    permissions: [PERMISSIONS.VIEW_MY_LISTINGS],
    roles: ['seller']
  },
  {
    label: 'Pre-ordenes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.preOrders,
    exact: true,
    permissions: [PERMISSIONS.CREATE_PRE_ORDER],
    roles: ['buyer']
  },
  {
    label: 'Mis compras',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.orders,
    exact: false,
    roles: ['buyer']
  },
  {
    label: 'Ventas recibidas',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.orders,
    exact: false,
    roles: ['seller']
  },
  {
    label: 'Ordenes',
    group: 'Marketplace',
    icon: 'clipboard-list',
    route: APP_ROUTES.orders,
    exact: false,
    roles: ['admin']
  },
  {
    label: 'Solicitudes',
    group: 'Marketplace',
    icon: 'sparkles',
    route: APP_ROUTES.requests,
    exact: true,
    permissions: [PERMISSIONS.VIEW_REQUESTS],
    roles: ['seller', 'buyer']
  },
  {
    label: 'Recomendaciones',
    group: 'Intelligence',
    icon: 'sparkles',
    route: APP_ROUTES.recommendations,
    exact: true,
    permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS],
    roles: ['buyer']
  },
  // {
  //   label: 'Sector de valor',
  //   group: 'Intelligence',
  //   icon: 'sparkles',
  //   route: APP_ROUTES.valueSector,
  //   exact: true,
  //   permissions: [PERMISSIONS.VIEW_VALUE_SECTOR]
  // },
  // {
  //   label: 'Recomendaciones',
  //   group: 'Intelligence',
  //   icon: 'sparkles',
  //   route: APP_ROUTES.recommendations,
  //   exact: true,
  //   permissions: [PERMISSIONS.VIEW_RECOMMENDATIONS]
  // },
  {
    label: 'Mensajes',
    group: 'Intelligence',
    icon: 'messages',
    route: APP_ROUTES.messages,
    exact: true,
    permissions: [PERMISSIONS.VIEW_MESSAGES],
    roles: ['seller', 'buyer']
  },
  {
    label: 'Admin empresas',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.admin,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_USERS],
    roles: ['admin']
  },
  {
    label: 'Perfil',
    group: 'Account',
    icon: 'circle-user-round',
    route: APP_ROUTES.profile,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PROFILE],
    roles: ['seller', 'buyer', 'admin']
  },
  {
    label: 'Configuración',
    group: 'Account',
    icon: 'settings',
    route: APP_ROUTES.settings,
    exact: true,
    permissions: [PERMISSIONS.MANAGE_PROFILE],
    roles: ['seller', 'buyer', 'admin']
  }
];
