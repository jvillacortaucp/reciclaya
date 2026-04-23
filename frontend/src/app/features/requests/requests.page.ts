import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-requests-page',
  imports: [SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Solicitudes" subtitle="Administra solicitudes recibidas y emitidas" />
    <ui-card>
      <p class="text-sm text-slate-600">Pantalla placeholder preparada para la bandeja de solicitudes.</p>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsPageComponent {}
