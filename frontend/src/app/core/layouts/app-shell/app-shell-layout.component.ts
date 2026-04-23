import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCircleUserRound,
  LucideClipboardList,
  LucideLayoutDashboard,
  LucideMenu,
  LucidePackagePlus,
  LucideSearch,
  LucideSettings,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStore
} from '@lucide/angular';
import { NgClass } from '@angular/common';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { SIDEBAR_NAV_ITEMS } from '../../constants/sidebar-nav.constants';
import { ICON_REGISTRY } from '../../constants/icon-registry.constants';
import { APP_NAME } from '../../constants/app.constants';

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgClass,
    LucideMenu,
    LucideSearch,
    LucideCircleUserRound,
    LucideLayoutDashboard,
    LucidePackagePlus,
    LucideStore,
    LucideClipboardList,
    LucideSlidersHorizontal,
    LucideSparkles,
    LucideSettings
  ],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellLayoutComponent {
  private readonly authFacade = inject(AuthFacade);

  protected readonly appName = APP_NAME;
  protected readonly icons = ICON_REGISTRY;
  protected readonly isSidebarCollapsed = signal(false);
  protected readonly currentUser = this.authFacade.user;
  protected readonly navItems = computed(() =>
    SIDEBAR_NAV_ITEMS.filter((item) => {
      if (!item.permissions?.length) {
        return true;
      }

      return item.permissions.every((permission) => this.authFacade.hasPermission(permission));
    })
  );

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }

  protected logout(): void {
    this.authFacade.logout();
  }
}
