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
  LucideStore,
  LucideBotMessageSquare,
  LucideShoppingCart,
  LucideWallet
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
    LucideLogOut,
    LucideBotMessageSquare,
    LucideShoppingCart,
    LucideWallet
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
  protected readonly isAuthenticated = this.authFacade.isAuthenticated;
  protected readonly containerReady = signal(false);
  protected readonly sidebarReady = signal(false);
  protected readonly activeSweepKey = signal('');
  protected readonly reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  protected readonly navItems = computed(() =>
    SIDEBAR_NAV_ITEMS.filter((item) => {
      if (!this.isAuthenticated()) {
        return item.publicAccess === true;
      }

      const hasPermissions = !item.permissions?.length || item.permissions.every((p) => this.authFacade.hasPermission(p));
      const hasRole = !item.roles?.length || this.authFacade.hasAnyRole(item.roles);
      return hasPermissions && hasRole;
    })
  );

  protected readonly mainNavItems = computed(() =>
    this.navItems().filter((item) => item.group !== 'Account')
  );

  protected readonly accountNavItems = computed(() =>
    this.navItems().filter((item) => item.group === 'Account')
  );

  constructor() {
    this.activeSweepKey.set('');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.containerReady.set(true);
        const entryDelay = this.reduceMotion ? 0 : 360;
        setTimeout(() => {
          this.sidebarReady.set(true);
          this.activeSweepKey.set(`${this.currentUrl()}-${Date.now()}`);
        }, entryDelay);
      });
    });
    const subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const normalized = this.normalizeUrl(this.router.url);
        this.currentUrl.set(normalized);
        this.activeSweepKey.set('');
        const sweepDelay = this.containerReady() ? 40 : 380;
        setTimeout(() => this.activeSweepKey.set(`${normalized}-${Date.now()}`), sweepDelay);
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onLogout(): void {
    this.authFacade.logout();
  }

  onLogin(): void {
    const returnUrl = this.currentUrl();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl }
    });
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

  protected iconDelayMs(index: number, account = false): number {
    if (this.reduceMotion) {
      return 0;
    }

    const offset = account ? this.mainNavItems().length : 0;
    return 60 + (index + offset) * 60;
  }

  protected labelDelayMs(index: number, account = false): number {
    return this.iconDelayMs(index, account) + (this.reduceMotion ? 0 : 90);
  }

  protected shouldSweep(item: SidebarNavItem): boolean {
    return this.isRouteActive(item) && !!this.activeSweepKey();
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }
}
