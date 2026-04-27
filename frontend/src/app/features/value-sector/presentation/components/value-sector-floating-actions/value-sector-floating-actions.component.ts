import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBarChart3,
  LucideBot,
  LucideFilePlus2,
  LucidePlus,
  LucideScanSearch,
  LucideStore
} from '@lucide/angular';
import { APP_ROUTES } from '../../../../../core/constants/app.constants';
import { TourGuideService } from '../../../../../core/services/tour-guide.service';

@Component({
  selector: 'app-value-sector-floating-actions',
  standalone: true,
  imports: [
    RouterLink,
    LucideBot,
    LucidePlus,
    LucideFilePlus2,
    LucideScanSearch,
    LucideBarChart3,
    LucideStore
  ],
  templateUrl: './value-sector-floating-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorFloatingActionsComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly tourGuide = inject(TourGuideService);

  protected readonly isOpen = signal(false);
  protected readonly imageError = signal(false);
  protected readonly routes = APP_ROUTES;
  protected readonly botImageUrl = 'assets/images/bot-guide.jpg';

  toggleMenu(): void {
    this.isOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  protected startGuide(): void {
    this.tourGuide.launchFromBot();
    this.closeMenu();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!target) return;
    if (!this.elementRef.nativeElement.contains(target as Node)) {
      this.closeMenu();
    }
  }
}
