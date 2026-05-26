import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ProtectedActionModalComponent } from './core/components/protected-action-modal/protected-action-modal.component';
import { AuthSplitTransitionOverlayComponent } from './features/auth/components/auth-split-transition-overlay.component';
import { AuthTransitionService } from './features/auth/services/auth-transition.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProtectedActionModalComponent, AuthSplitTransitionOverlayComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authTransition = inject(AuthTransitionService);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.authTransition.phase() !== 'navigating') {
          return;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              this.authTransition.finish();
              setTimeout(() => this.authTransition.reset(), this.authTransition.FINISH_FADE_MS);
            }, this.authTransition.POST_NAV_HOLD_MS);
          });
        });
      });
  }
}
