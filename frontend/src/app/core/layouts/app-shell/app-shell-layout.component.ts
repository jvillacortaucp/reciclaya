import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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

  constructor() {
    if (this.router.url.startsWith('/app')) {
      this.authFacade.syncSession();
    }

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
}
