export interface SidebarNavItem {
  readonly label: string;
  readonly group: 'Marketplace' | 'Intelligence' | 'Account' | 'General';
  readonly icon: string;
  readonly route: string;
  readonly permissions?: readonly string[];
}
