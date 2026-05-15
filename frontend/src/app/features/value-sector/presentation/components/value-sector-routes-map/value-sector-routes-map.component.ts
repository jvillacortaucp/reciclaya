import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  LucideFlame,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideSprout,
  LucideUtensils
} from '@lucide/angular';
import { ValueSectorRoute } from '../../../models/value-sector.model';

@Component({
  selector: 'app-value-sector-routes-map',
  standalone: true,
  imports: [LucideUtensils, LucideSparkles, LucidePill, LucideSprout, LucideFlame, LucidePackage],
  templateUrl: './value-sector-routes-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorRoutesMapComponent {
  routes = input.required<readonly ValueSectorRoute[]>();
  residueLabel = input<string>('Residuo base');
  selectedRouteId = input<string | null>(null);

  routeSelected = output<string>();

  protected readonly visibleRoutes = computed(() => this.routes().slice(0, 4));
  protected readonly routeCoords = [
    { x: 18, y: 8 },
    { x: 18, y: 58 },
    { x: 67, y: 8 },
    { x: 67, y: 58 }
  ] as const;

  protected matchPercent(route: ValueSectorRoute): number {
    switch (route.marketPotential) {
      case 'high':
        return 94;
      case 'medium':
        return 82;
      default:
        return 76;
    }
  }

  protected iconBgClass(route: ValueSectorRoute): string {
    switch (route.marketPotential) {
      case 'high':
        return 'bg-emerald-50 text-emerald-600';
      case 'medium':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-amber-50 text-amber-600';
    }
  }

  protected onSelect(routeId: string): void {
    this.routeSelected.emit(routeId);
  }
}
