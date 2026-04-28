import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideLeaf, LucideLoaderCircle, LucideWandSparkles } from '@lucide/angular';
import { ValueSectorFacade } from './application/value-sector.facade';
import { VALUE_SECTOR_TEXT } from './data/value-sector.constants';
import { TourGuideService } from '../../core/services/tour-guide.service';
import { ValueSectorAccordionComponent } from './presentation/components/value-sector-accordion/value-sector-accordion.component';
import { ValueSectorFloatingActionsComponent } from './presentation/components/value-sector-floating-actions/value-sector-floating-actions.component';
import { ValueSectorSummaryComponent } from './presentation/components/value-sector-summary/value-sector-summary.component';

import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-value-sector-page',
  standalone: true,
  providers: [ValueSectorFacade],
  imports: [
    LucideLeaf,
    LucideWandSparkles,
    LucideLoaderCircle,
    ValueSectorAccordionComponent,
    ValueSectorSummaryComponent,
    ValueSectorFloatingActionsComponent,
    SectionHeaderComponent
  ],
  templateUrl: './value-sector.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(ValueSectorFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tourGuide = inject(TourGuideService);
  private observer: IntersectionObserver | null = null;

  @ViewChild('infiniteScrollSentinel') private sentinelRef?: ElementRef<HTMLDivElement>;

  protected readonly isInitialLoading = this.facade.isInitialLoading;
  protected readonly items = this.facade.items;
  protected readonly hasMore = this.facade.hasMore;
  protected readonly isLoadingMore = this.facade.isLoadingMore;
  protected readonly isGenerating = this.facade.isGenerating;
  protected readonly loadError = this.facade.loadError;
  protected readonly fromListingMode = this.facade.fromListingMode;
  protected readonly listingResidueLabel = this.facade.listingResidueLabel;
  protected readonly selectedRouteId = this.facade.selectedRouteId;
  protected readonly selectedProductId = this.facade.selectedProductId;
  protected readonly expandedRouteId = this.facade.expandedRouteId;
  protected readonly summary = this.facade.summary;
  protected readonly completion = this.facade.completion;
  protected readonly text = VALUE_SECTOR_TEXT;

  ngOnInit(): void {
    this.tourGuide.init();
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.facade.initialize(params.get('listing'));
      });
  }

  ngAfterViewInit(): void {
    if (!this.sentinelRef?.nativeElement) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const sentinelVisible = entries.some((entry) => entry.isIntersecting);
        if (sentinelVisible) {
          this.facade.loadMore();
        }
      },
      { root: null, rootMargin: '260px 0px', threshold: 0.1 }
    );

    this.observer.observe(this.sentinelRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected onRouteToggled(routeId: string): void {
    this.facade.toggleExpandedRoute(routeId);
    this.tourGuide.notifyValueSectorSelected(routeId);
  }

  protected onProductSelected(payload: { routeId: string; productId: string }): void {
    this.facade.selectProduct(payload.routeId, payload.productId);
    this.tourGuide.notifyValueProductSelected(payload.routeId, payload.productId);
  }

  protected onProcessRequested(): void {
    this.navigateToRecommendations('process');
  }

  protected onExplanationRequested(): void {
    this.navigateToRecommendations('explanation');
  }

  protected onMarketRequested(): void {
    this.navigateToRecommendations('market');
  }

  protected onGenerateRequested(): void {
    this.facade.generateForSelectedListing();
  }

  private navigateToRecommendations(tab: 'process' | 'explanation' | 'market'): void {
    const productId = this.selectedProductId();
    if (!productId) {
      return;
    }

    this.tourGuide.notifyRecommendationRouteChosen(tab, productId);

    void this.router.navigate(['/app/recommendations', productId], {
      queryParams: { tab }
    });
  }
}
