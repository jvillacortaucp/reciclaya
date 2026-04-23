import { Route } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const WASTE_SELL_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./waste-sell.page').then((m) => m.WasteSellPageComponent),
    canDeactivate: [pendingChangesGuard],
    data: {
      meta: {
        title: 'Registrar residuo para venta',
        breadcrumb: 'Registrar residuo',
        icon: 'package-plus',
        permissions: ['manage:waste']
      }
    }
  }
];
