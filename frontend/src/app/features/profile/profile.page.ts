import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-profile-page',
  imports: [SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Perfil" subtitle="Gestiona tus datos de empresa y verificacion" />
    <ui-card>
      <p class="text-sm text-slate-600">Placeholder listo para integrar tus pantallas de perfil detallado.</p>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageComponent {}
