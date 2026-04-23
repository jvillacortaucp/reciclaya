export const ICON_REGISTRY = {
  home: 'home',
  menu: 'menu',
  search: 'search',
  chevronLeft: 'chevron-left',
  layoutDashboard: 'layout-dashboard',
  packagePlus: 'package-plus',
  store: 'store',
  clipboardList: 'clipboard-list',
  slidersHorizontal: 'sliders-horizontal',
  sparkles: 'sparkles',
  circleUserRound: 'circle-user-round',
  settings: 'settings',
  badgeCheck: 'badge-check'
} as const;

export type IconRegistryKey = keyof typeof ICON_REGISTRY;
