import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
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
import { SidebarNavItem } from '../models/sidebar-nav-item.model';
import { AuthFacade } from '../../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();
  protected readonly currentUrl = signal(this.normalizeUrl(this.router.url));

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

  constructor() {
    const subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl.set(this.normalizeUrl(this.router.url));
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onLogout(): void {
    this.authFacade.logout();
  }

  onLinkClick(): void {
    this.closeSidebar.emit();
  }

  protected isRouteActive(item: SidebarNavItem): boolean {
    const url = this.currentUrl();
    const paths = item.activePaths?.length ? item.activePaths : [item.route];

    return paths.some((path) => {
      const normalizedPath = this.normalizeUrl(path);
      if (item.exact !== false) {
        return url === normalizedPath;
      }

      return url === normalizedPath || url.startsWith(`${normalizedPath}/`);
    });
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }
}
