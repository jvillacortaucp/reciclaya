import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCircleUserRound,
  LucideClipboardList,
  LucideLayoutDashboard,
  LucideMessageSquare,
  LucideLogOut,
  LucidePlusCircle,
  LucideSettings,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStore
} from '@lucide/angular';
import { SIDEBAR_NAV_ITEMS } from '../constants/sidebar-nav.constants';
import { AuthFacade } from '../../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideCircleUserRound,
    LucideLayoutDashboard,
    LucidePlusCircle,
    LucideSlidersHorizontal,
    LucideStore,
    LucideClipboardList,
    LucideMessageSquare,
    LucideSparkles,
    LucideSettings,
    LucideLogOut
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private readonly authFacade = inject(AuthFacade);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  protected readonly navItems = computed(() =>
    SIDEBAR_NAV_ITEMS.filter((item) => {
      if (!item.permissions?.length) return true;
      return item.permissions.every((p) => this.authFacade.hasPermission(p));
    })
  );

  protected readonly mainNavItems = computed(() =>
    this.navItems().filter((item) => item.group !== 'Account')
  );

  protected readonly accountNavItems = computed(() =>
    this.navItems().filter((item) => item.group === 'Account')
  );

  onLogout(): void {
    this.authFacade.logout();
  }

  onLinkClick(): void {
    this.closeSidebar.emit();
  }
}
