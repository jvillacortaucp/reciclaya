import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent
  ],
  templateUrl: './app-shell-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellLayoutComponent {
  protected readonly isSidebarOpen = signal(false);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.normalizeUrl(this.router.url));
  protected readonly isAuthenticated = this.authFacade.isAuthenticated;
  protected readonly shouldHideSidebarForGuest = computed(() => {
    if (this.isAuthenticated()) {
      return false;
    }

    const url = this.currentUrl();
    const isMarketplace = url === '/marketplace' || url.startsWith('/marketplace/');
    const isAssistantChat = url === '/assistant-chat';
    return isMarketplace && !isAssistantChat;
  });
  protected readonly showSidebar = computed(() => !this.shouldHideSidebarForGuest());

  constructor() {
    if (this.router.url.startsWith('/app')) {
      this.authFacade.syncSession();
    }

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl.set(this.normalizeUrl(this.router.url));
        if (!this.showSidebar()) {
          this.closeSidebar();
        }
      });

    effect(() => {
      if (this.isSidebarOpen()) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    this.closeSidebar();
  }

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }
}
