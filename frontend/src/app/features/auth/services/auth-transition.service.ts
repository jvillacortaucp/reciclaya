import { Injectable, signal } from '@angular/core';

export type AuthTransitionPhase = 'idle' | 'prepared' | 'opening' | 'navigating' | 'finishing';

@Injectable({ providedIn: 'root' })
export class AuthTransitionService {
  readonly OPEN_DURATION_MS = 940;
  readonly NAVIGATION_TRIGGER_MS = 250;
  readonly FINISH_FADE_MS = 280;
  readonly POST_NAV_HOLD_MS = 140;

  readonly isPlaying = signal(false);
  readonly phase = signal<AuthTransitionPhase>('idle');
  readonly targetUrl = signal<string | null>(null);

  startPrepared(targetUrl: string): void {
    this.targetUrl.set(targetUrl);
    this.isPlaying.set(true);
    this.phase.set('prepared');
  }

  startOpening(): void {
    if (!this.isPlaying()) {
      return;
    }

    this.phase.set('opening');
  }

  markNavigating(): void {
    if (!this.isPlaying()) {
      return;
    }

    this.phase.set('navigating');
  }

  finish(): void {
    if (!this.isPlaying()) {
      return;
    }

    this.phase.set('finishing');
  }

  reset(): void {
    this.isPlaying.set(false);
    this.phase.set('idle');
    this.targetUrl.set(null);
  }
}
