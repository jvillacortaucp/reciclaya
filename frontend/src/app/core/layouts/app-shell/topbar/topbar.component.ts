import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { LucideMenu, LucideSearch, LucideBell, LucideLeaf } from '@lucide/angular';
import { AuthFacade } from '../../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [LucideMenu, LucideSearch, LucideBell, LucideLeaf],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
  private readonly authFacade = inject(AuthFacade);

  toggleSidebar = output<void>();

  protected readonly displayName = computed(() => this.authFacade.user()?.fullName ?? 'Usuario');
  protected readonly avatarUrl = computed(() => this.authFacade.user()?.avatarUrl ?? null);
  protected readonly initials = computed(() => {
    const name = this.displayName().trim();
    if (!name) {
      return 'U';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  });
}
