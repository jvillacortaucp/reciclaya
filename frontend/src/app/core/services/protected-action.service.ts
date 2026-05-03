import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app.constants';
import { AuthFacade } from '../../features/auth/services/auth.facade';

interface ProtectedActionState {
  readonly open: boolean;
  readonly actionName: string;
  readonly returnUrl: string;
}

interface PendingAction {
  readonly onAllowed: () => void;
}

@Injectable({ providedIn: 'root' })
export class ProtectedActionService {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly state = signal<ProtectedActionState>({
    open: false,
    actionName: '',
    returnUrl: ''
  });
  private pendingAction: PendingAction | null = null;

  readonly dialogState = computed(() => this.state());

  requireAuthForAction(options: {
    actionName: string;
    returnUrl: string;
    onAllowed: () => void;
  }): void {
    if (this.authFacade.isAuthenticated()) {
      options.onAllowed();
      return;
    }

    this.pendingAction = { onAllowed: options.onAllowed };
    this.state.set({
      open: true,
      actionName: options.actionName,
      returnUrl: this.normalizeReturnUrl(options.returnUrl)
    });
  }

  confirmLogin(): void {
    const returnUrl = this.state().returnUrl;
    this.closeDialog();
    void this.router.navigate([APP_ROUTES.login], {
      queryParams: { returnUrl }
    });
  }

  confirmRegister(): void {
    const returnUrl = this.state().returnUrl;
    this.closeDialog();
    void this.router.navigate([APP_ROUTES.register], {
      queryParams: { returnUrl }
    });
  }

  cancel(): void {
    this.closeDialog();
  }

  runPendingIfAllowed(): void {
    if (!this.authFacade.isAuthenticated() || !this.pendingAction) {
      return;
    }

    const action = this.pendingAction;
    this.pendingAction = null;
    action.onAllowed();
  }

  clearPendingAction(): void {
    this.pendingAction = null;
  }

  private closeDialog(): void {
    this.state.set({
      open: false,
      actionName: '',
      returnUrl: ''
    });
  }

  private normalizeReturnUrl(url: string): string {
    if (!url) {
      return APP_ROUTES.marketplace;
    }

    return url.startsWith('/') ? url : `/${url}`;
  }
}

