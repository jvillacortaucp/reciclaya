import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../constants/media.constants';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideMenu, LucideBell, LucideLogIn } from '@lucide/angular';
import { APP_ROUTES } from '../../../../core/constants/app.constants';
import { ComplianceLevelsStore } from '../../../../core/regulatory/compliance-levels.store';
import { RegulatoryLevel } from '../../../../core/regulatory/regulatory.models';
import { AuthFacade } from '../../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ReactiveFormsModule, LucideMenu, LucideBell, LucideLogIn],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
  private readonly authFacade = inject(AuthFacade);
  private readonly complianceLevelsStore = inject(ComplianceLevelsStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  canToggleSidebar = input<boolean>(true);
  toggleSidebar = output<void>();
  protected readonly searchForm = this.fb.nonNullable.group({
    query: ['']
  });

  protected readonly currentUrl = signal(this.normalizeUrl(this.router.url));

  protected readonly isAuthenticated = this.authFacade.isAuthenticated;
  protected readonly displayName = computed(() => this.authFacade.user()?.fullName ?? 'Usuario');
  protected readonly currentComplianceLevel = computed<RegulatoryLevel>(() =>
    this.complianceLevelsStore.getCurrentLevel(this.authFacade.user()?.id)
  );
  protected readonly currentComplianceLevelLabel = computed(() => `Nivel ${this.currentComplianceLevel()}`);
  protected readonly avatarClasses = computed(() => {
    const accentClasses: Record<RegulatoryLevel, string> = {
      1: 'border-emerald-200 ring-2 ring-emerald-100 text-emerald-700',
      2: 'border-cyan-200 ring-2 ring-cyan-100 text-cyan-700',
      3: 'border-amber-200 ring-2 ring-amber-100 text-amber-700',
      4: 'border-rose-200 ring-2 ring-rose-100 text-rose-700'
    };

    return `w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs border overflow-hidden group-hover:bg-slate-200 transition-colors ${accentClasses[this.currentComplianceLevel()]}`;
  });
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

  protected avatarLoaded = false;

  protected onAvatarLoad(): void {
    this.avatarLoaded = true;
  }

  protected onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src === this.fallbackImage) return;
    img.src = this.fallbackImage;
    this.avatarLoaded = true;
  }

  onLogin(): void {
    const returnUrl = this.currentUrl();
    void this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl }
    });
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }
}
