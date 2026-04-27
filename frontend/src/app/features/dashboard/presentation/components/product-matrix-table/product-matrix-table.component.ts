import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProductMatrixItem } from '../../../models/dashboard-impact.model';

@Component({
  selector: 'app-product-matrix-table',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-matrix-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductMatrixTableComponent {
  items = input.required<readonly ProductMatrixItem[]>();
}

