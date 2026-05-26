import { ChangeDetectionStrategy, Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { APP_ROUTES } from '../../constants/app.constants';
import { AssistantChatHttpService } from '../../../features/assistant-chat/infrastructure/assistant-chat.http.service';
import { MarketplaceEcoChatFacade } from '../../../features/marketplace/application/marketplace-eco-chat.facade';
import { DefaultChatBubbleComponent } from '../../../shared/ui/default-chat-bubble/default-chat-bubble.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    DefaultChatBubbleComponent
  ],
  providers: [AssistantChatHttpService, MarketplaceEcoChatFacade],
  templateUrl: './app-shell-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellLayoutComponent {
  protected readonly isSidebarOpen = signal(false);
  private readonly authFacade = inject(AuthFacade);
  private readonly ecoChatFacade = inject(MarketplaceEcoChatFacade);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.normalizeUrl(this.router.url));
  protected readonly isAuthenticated = this.authFacade.isAuthenticated;
  protected readonly ecoMessages = this.ecoChatFacade.messages;
  protected readonly ecoTyping = this.ecoChatFacade.typing;
  protected readonly ecoShowGoToMainChatCta = this.ecoChatFacade.showGoToMainChatCta;
  protected readonly ecoDisabledInput = this.ecoChatFacade.disabledInput;
  protected readonly isAssistantChatRoute = computed(() => this.currentUrl() === '/assistant-chat');
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

  protected openEcoChat(): void {
    void this.router.navigateByUrl(APP_ROUTES.assistantChat);
  }

  protected openEcoChatWithMessage(message: string): void {
    const trimmed = message.trim();
    if (!trimmed) {
      void this.router.navigateByUrl(APP_ROUTES.assistantChat);
      return;
    }

    this.ecoChatFacade.submitMessage(trimmed);
  }

  protected goToMainEcoChat(): void {
    const draft = this.ecoChatFacade.lastUserMessage().trim();
    void this.router.navigate([APP_ROUTES.assistantChat], {
      queryParams: draft ? { draft } : undefined
    });
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }
}
