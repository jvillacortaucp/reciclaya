import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCircleUserRound,
  LucideClipboardList,
  LucideLayoutDashboard,
  LucideLeaf,
  LucideMessageSquare,
  LucideMenu,
  LucidePackagePlus,
  LucideSearch,
  LucideSettings,
  LucideSparkles,
  LucideStore
} from '@lucide/angular';
import { NgClass } from '@angular/common';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { SIDEBAR_NAV_ITEMS } from '../../constants/sidebar-nav.constants';

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgClass,
    LucideMenu,
    LucideSearch,
    LucideLeaf,
    LucideCircleUserRound,
    LucideLayoutDashboard,
    LucidePackagePlus,
    LucideStore,
    LucideClipboardList,
    LucideMessageSquare,
    LucideSparkles,
    LucideSettings
  ],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellLayoutComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly isSidebarCollapsed = signal(false);
  protected readonly navItems = computed(() =>
    SIDEBAR_NAV_ITEMS.filter((item) => {
      if (!item.permissions?.length) {
        return true;
      }

      return item.permissions.every((permission) => this.authFacade.hasPermission(permission));
    })
  );
  protected readonly mainNavItems = computed(() =>
    this.navItems().filter((item) => item.group !== 'Account')
  );
  protected readonly accountNavItems = computed(() =>
    this.navItems().filter((item) => item.group === 'Account')
  );

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
