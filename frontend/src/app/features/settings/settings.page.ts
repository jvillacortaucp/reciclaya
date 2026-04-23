import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-settings-page',
  imports: [SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Ajustes" subtitle="Configura notificaciones, seguridad y preferencias" />
    <ui-card>
      <p class="text-sm text-slate-600">Placeholder listo para conectar configuraciones avanzadas de cuenta.</p>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {}
