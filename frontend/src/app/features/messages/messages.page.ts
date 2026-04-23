import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-messages-page',
  imports: [SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Mensajes" subtitle="Conversa con compradores y operadores logisticos" />
    <ui-card>
      <p class="text-sm text-slate-600">Pantalla placeholder preparada para mensajeria interna.</p>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesPageComponent {}
