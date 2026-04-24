import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { LucideBell, LucideLeaf, LucideSettings } from '@lucide/angular';
import { ValueRoutesFacade } from './application/value-routes.facade';
import { VALUE_ROUTE_TEXT } from './data/value-route.constants';
import { ValueRouteSummaryComponent } from './presentation/components/value-route-summary/value-route-summary.component';
import { ValueRoutesComponent } from './presentation/components/value-routes/value-routes.component';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  providers: [ValueRoutesFacade],
  imports: [
    LucideLeaf,
    LucideBell,
    LucideSettings,
    ValueRoutesComponent,
    ValueRouteSummaryComponent
  ],
  templateUrl: './recommendations.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPageComponent implements OnInit {
  private readonly facade = inject(ValueRoutesFacade);

  protected readonly loading = this.facade.loading;
  protected readonly routes = this.facade.routes;
  protected readonly selectedRouteId = this.facade.selectedRouteId;
  protected readonly selectedProductId = this.facade.selectedProductId;
  protected readonly expandedRouteId = this.facade.expandedRouteId;
  protected readonly summary = this.facade.summary;
  protected readonly completion = this.facade.completion;
  protected readonly text = VALUE_ROUTE_TEXT;

  ngOnInit(): void {
    this.facade.loadRoutes();
  }

  protected onRouteSelected(routeId: string): void {
    this.facade.selectRoute(routeId);
  }

  protected onProductSelected(payload: { routeId: string; productId: string }): void {
    this.facade.selectProduct(payload.routeId, payload.productId);
  }
}
