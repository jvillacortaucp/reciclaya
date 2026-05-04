import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../constants/media.constants';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideMenu, LucideSearch, LucideBell, LucideLeaf } from '@lucide/angular';
import { APP_ROUTES } from '../../../../core/constants/app.constants';
import { AuthFacade } from '../../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ReactiveFormsModule, LucideMenu, LucideSearch, LucideBell, LucideLeaf],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  toggleSidebar = output<void>();
  protected readonly searchForm = this.fb.nonNullable.group({
    query: ['']
  });

  protected readonly isAuthenticated = this.authFacade.isAuthenticated;
  protected readonly displayName = computed(() => this.authFacade.user()?.fullName ?? 'Usuario');
  protected readonly avatarUrl = computed(() => this.authFacade.user()?.avatarUrl ?? null);
  protected readonly fallbackImage = FALLBACK_IMAGE_URL;
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

  protected submitSearch(): void {
    const query = this.searchForm.controls.query.value.trim();
    void this.router.navigate([APP_ROUTES.marketplace], {
      queryParams: query ? { q: query } : {}
    });
  }
}
