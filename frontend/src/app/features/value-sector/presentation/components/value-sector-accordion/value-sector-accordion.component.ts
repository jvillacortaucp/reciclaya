import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideDroplets,
  LucideFlame,
  LucideFlaskConical,
  LucideHammer,
  LucideMicroscope,
  LucidePackage,
  LucidePill,
  LucideSparkles,
  LucideSprout,
  LucideStore,
  LucideUtensils
} from '@lucide/angular';
import { VALUE_SECTOR_POTENTIAL_LABEL } from '../../../data/value-sector.constants';
import { ValueSectorRoute } from '../../../models/value-sector.model';
import { ValueSectorProductSelectorComponent } from '../value-sector-product-selector/value-sector-product-selector.component';

@Component({
  selector: 'app-value-sector-accordion',
  standalone: true,
  imports: [
    NgClass,
    LucideUtensils,
    LucideSparkles,
    LucidePill,
    LucideSprout,
    LucideFlame,
    LucideMicroscope,
    LucideFlaskConical,
    LucideDroplets,
    LucideHammer,
    LucidePackage,
    LucideStore,
    LucideChevronDown,
    LucideChevronUp,
    ValueSectorProductSelectorComponent
  ],
  templateUrl: './value-sector-accordion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorAccordionComponent {
  routes = input.required<readonly ValueSectorRoute[]>();
  expandedRouteId = input<string | null>(null);
  selectedRouteId = input<string | null>(null);
  selectedProductId = input<string | null>(null);

  routeToggled = output<string>();
  productSelected = output<{ routeId: string; productId: string }>();

  protected readonly potentialLabel = VALUE_SECTOR_POTENTIAL_LABEL;

  onToggleRoute(routeId: string): void {
    this.routeToggled.emit(routeId);
  }

  onProductSelected(routeId: string, productId: string): void {
    this.productSelected.emit({ routeId, productId });
  }
}
