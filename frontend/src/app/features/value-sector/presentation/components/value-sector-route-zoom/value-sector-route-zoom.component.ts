import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideSparkles } from '@lucide/angular';

@Component({
  selector: 'app-value-sector-route-zoom',
  standalone: true,
  imports: [LucideSparkles],
  templateUrl: './value-sector-route-zoom.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorRouteZoomComponent {
  routeName = input.required<string>();
}
