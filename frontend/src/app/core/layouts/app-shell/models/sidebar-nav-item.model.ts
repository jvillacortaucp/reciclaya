export interface SidebarNavItem {
  readonly label: string;
  readonly group: 'Marketplace' | 'Intelligence' | 'Account' | 'General';
  readonly icon: string;
  readonly route: string;
  readonly activePaths?: readonly string[];
  readonly exact?: boolean;
  readonly permissions?: readonly string[];
  readonly roles?: readonly string[];
}
