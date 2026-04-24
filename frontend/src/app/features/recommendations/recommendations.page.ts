import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { LucideLeaf } from '@lucide/angular';
import { ValueRoutesFacade } from './application/value-routes.facade';
import { VALUE_ROUTE_TEXT } from './data/value-route.constants';
import { ValueRouteFloatingActionsComponent } from './presentation/components/value-route-floating-actions/value-route-floating-actions.component';
import { ValueRouteSummaryComponent } from './presentation/components/value-route-summary/value-route-summary.component';
import { ValueRoutesComponent } from './presentation/components/value-routes/value-routes.component';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  providers: [ValueRoutesFacade],
  imports: [LucideLeaf, ValueRoutesComponent, ValueRouteSummaryComponent, ValueRouteFloatingActionsComponent],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(ValueRoutesFacade);
  private observer: IntersectionObserver | null = null;

  @ViewChild('infiniteScrollSentinel') private sentinelRef?: ElementRef<HTMLDivElement>;

  protected readonly isInitialLoading = this.facade.isInitialLoading;
  protected readonly routes = this.facade.items;
  protected readonly hasMore = this.facade.hasMore;
  protected readonly isLoadingMore = this.facade.isLoadingMore;
  protected readonly selectedRouteId = this.facade.selectedRouteId;
  protected readonly selectedProductId = this.facade.selectedProductId;
  protected readonly expandedRouteId = this.facade.expandedRouteId;
  protected readonly summary = this.facade.summary;
  protected readonly completion = this.facade.completion;
  protected readonly text = VALUE_ROUTE_TEXT;

  ngOnInit(): void {
    this.facade.loadInitial();
  }

  ngAfterViewInit(): void {
    if (!this.sentinelRef?.nativeElement) {
      return;
    }

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
  }

  protected onProductSelected(payload: { routeId: string; productId: string }): void {
    this.facade.selectProduct(payload.routeId, payload.productId);
  }
}
