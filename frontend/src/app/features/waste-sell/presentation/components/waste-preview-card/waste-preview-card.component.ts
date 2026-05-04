import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideMapPin } from '@lucide/angular';
import { ListingPreviewSummary } from '../../../domain/waste-sell.models';

@Component({
  selector: 'app-waste-preview-card',
  standalone: true,
  imports: [CommonModule, LucideMapPin],
  templateUrl: './waste-preview-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WastePreviewCardComponent {
  @Input() summary: ListingPreviewSummary | null = null;
  @Input() loading = false;

  // Muestra el valor estimado en soles (S/). Si la etiqueta devuelta contiene USD
  // intentamos extraer el número y formatearlo como S/. Si no se puede parsear,
  // devolvemos la etiqueta original reemplazando la sigla USD por 'S/'.
  displayEstimatedValue(): string {
    const raw = this.summary?.estimatedValueLabel ?? '';

    if (!raw) return '';

    // Buscar el primer número (con decimales) en la cadena
    const match = raw.match(/([0-9]+(?:[.,][0-9]{1,2})?)/);
    if (match) {
      // Normalizar separador decimal a punto
      const numStr = match[1].replace(',', '.');
      const value = Number.parseFloat(numStr);
      if (!Number.isNaN(value)) {
        return `S/ ${value.toFixed(2)}`;
      }
    }

    // Fallback: reemplazar siglas USD por S/
    return raw.replace(/USD/gi, 'S/');
  }
}
