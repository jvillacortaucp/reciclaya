import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-my-listings-page',
  imports: [SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Mis publicaciones" subtitle="Gestiona lotes y estado de tus anuncios" />
    <ui-card>
      <p class="text-sm text-slate-600">Pantalla placeholder preparada para integrar la bandeja de publicaciones.</p>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyListingsPageComponent {}
