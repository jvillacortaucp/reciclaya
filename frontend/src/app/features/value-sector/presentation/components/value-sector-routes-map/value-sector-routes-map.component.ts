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
import { VALUE_SECTOR_MAP_LAYOUT } from '../../constants/value-sector-map-layout.constants';

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
  compactMode = input<boolean>(false);

  routeSelected = output<string>();

  protected readonly visibleRoutes = computed(() => this.routes().slice(0, 4));
  private readonly MOBILE_VIEWBOX_WIDTH = 320;
  private readonly MOBILE_VIEWBOX_HEIGHT = 340;
  // AJUSTE RAPIDO: mueve todo el bloque (nodo central + rutas + conectores)
  private readonly LAYOUT_SHIFT_X = 0;
  private readonly LAYOUT_SHIFT_Y = 0;

  // Centro del nodo principal (map-center)
  private readonly CENTER_X = VALUE_SECTOR_MAP_LAYOUT.centerX;
  private readonly CENTER_Y = VALUE_SECTOR_MAP_LAYOUT.centerY;
  private readonly MOBILE_CENTER_X = 160;
  private readonly MOBILE_CENTER_Y = 164;

  // Posiciones fijas de rutas por cuadrante (edita estos valores para mover cada card)
  // 0: arriba-izquierda
  private readonly ROUTE_TOP_LEFT_X = 200;
  private readonly ROUTE_TOP_LEFT_Y = 100;
  // 1: arriba-derecha
  private readonly ROUTE_TOP_RIGHT_X = 800;
  private readonly ROUTE_TOP_RIGHT_Y = 100;
  // 2: abajo-izquierda
  private readonly ROUTE_BOTTOM_LEFT_X = 200;
  private readonly ROUTE_BOTTOM_LEFT_Y = 450;
  // 3: abajo-derecha
  private readonly ROUTE_BOTTOM_RIGHT_X = 800;
  private readonly ROUTE_BOTTOM_RIGHT_Y = 450;
  // Posiciones compactas para móvil guiado
  private readonly MOBILE_ROUTE_TOP_LEFT_X = 74;
  private readonly MOBILE_ROUTE_TOP_LEFT_Y = 62;
  private readonly MOBILE_ROUTE_TOP_RIGHT_X = 246;
  private readonly MOBILE_ROUTE_TOP_RIGHT_Y = 62;
  private readonly MOBILE_ROUTE_BOTTOM_LEFT_X = 74;
  private readonly MOBILE_ROUTE_BOTTOM_LEFT_Y = 272;
  private readonly MOBILE_ROUTE_BOTTOM_RIGHT_X = 246;
  private readonly MOBILE_ROUTE_BOTTOM_RIGHT_Y = 272;
  // Inset final de conectores al borde de cada card.
  // Menor valor = conector llega más cerca del borde de la card.
  private readonly LEFT_CONNECTOR_END_INSET = 28;
  private readonly RIGHT_CONNECTOR_END_INSET = 8;

  protected readonly wrapperStyles = computed(() => ({
    minWidth: this.compactMode() ? '0px' : '620px',
    aspectRatio: this.compactMode() ? `${this.MOBILE_VIEWBOX_WIDTH} / ${this.MOBILE_VIEWBOX_HEIGHT}` : '1000 / 520'
  }));

  protected readonly viewBox = computed(() =>
    this.compactMode() ? `0 0 ${this.MOBILE_VIEWBOX_WIDTH} ${this.MOBILE_VIEWBOX_HEIGHT}` : '0 0 1000 520'
  );

  protected readonly routeCardWidth = computed(() => (this.compactMode() ? 110 : 176));
  protected readonly routeCardPadding = computed(() => (this.compactMode() ? 10 : 16));
  protected readonly routeIconBoxSize = computed(() => (this.compactMode() ? 34 : 48));
  protected readonly routeIconSize = computed(() => (this.compactMode() ? 16 : 20));
  protected readonly routeTitleFontSize = computed(() => (this.compactMode() ? 13 : 14));
  protected readonly routeScoreFontSize = computed(() => (this.compactMode() ? 18 : 30));
  protected readonly centerNodeSize = computed(() => (this.compactMode() ? 124 : 240));
  protected readonly centerPadding = computed(() => (this.compactMode() ? 14 : 24));
  protected readonly centerIconBoxSize = computed(() => (this.compactMode() ? 40 : 64));
  protected readonly centerIconSize = computed(() => (this.compactMode() ? 22 : 32));
  protected readonly centerTitleFontSize = computed(() => (this.compactMode() ? 13 : 14));

  protected readonly centerPoint = computed(() => ({
    x: (this.compactMode() ? this.MOBILE_CENTER_X : this.CENTER_X) + this.LAYOUT_SHIFT_X,
    y: (this.compactMode() ? this.MOBILE_CENTER_Y : this.CENTER_Y) + this.LAYOUT_SHIFT_Y
  }));

  protected readonly routeSlots = computed(() => {
    const center = this.centerPoint();
    const slots = this.compactMode()
      ? [
          { x: this.MOBILE_ROUTE_TOP_LEFT_X + this.LAYOUT_SHIFT_X, y: this.MOBILE_ROUTE_TOP_LEFT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.MOBILE_ROUTE_TOP_RIGHT_X + this.LAYOUT_SHIFT_X, y: this.MOBILE_ROUTE_TOP_RIGHT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.MOBILE_ROUTE_BOTTOM_LEFT_X + this.LAYOUT_SHIFT_X, y: this.MOBILE_ROUTE_BOTTOM_LEFT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.MOBILE_ROUTE_BOTTOM_RIGHT_X + this.LAYOUT_SHIFT_X, y: this.MOBILE_ROUTE_BOTTOM_RIGHT_Y + this.LAYOUT_SHIFT_Y }
        ]
      : [
          { x: this.ROUTE_TOP_LEFT_X + this.LAYOUT_SHIFT_X, y: this.ROUTE_TOP_LEFT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.ROUTE_TOP_RIGHT_X + this.LAYOUT_SHIFT_X, y: this.ROUTE_TOP_RIGHT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.ROUTE_BOTTOM_LEFT_X + this.LAYOUT_SHIFT_X, y: this.ROUTE_BOTTOM_LEFT_Y + this.LAYOUT_SHIFT_Y },
          { x: this.ROUTE_BOTTOM_RIGHT_X + this.LAYOUT_SHIFT_X, y: this.ROUTE_BOTTOM_RIGHT_Y + this.LAYOUT_SHIFT_Y }
        ];

    return slots.map((slot) => {
      const dx = slot.x - center.x;
      const dy = slot.y - center.y;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length;
      const uy = dy / length;

      // Inicio del conector sobre el borde del nodo central
      const startX = center.x + ux * 28;
      const startY = center.y + uy * 28;
      // Fin del conector antes de entrar a la card de ruta
      // Solo ajustamos derecha (TR/BR) para cerrar el gap visual.
      const endInset = slot.x >= center.x ? this.RIGHT_CONNECTOR_END_INSET : this.LEFT_CONNECTOR_END_INSET;
      const endX = slot.x - ux * endInset;
      const endY = slot.y - uy * endInset;

      return { ...slot, startX, startY, endX, endY };
    });
  });

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
