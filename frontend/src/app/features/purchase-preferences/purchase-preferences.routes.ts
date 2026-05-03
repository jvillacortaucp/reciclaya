import { Route } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const PURCHASE_PREFERENCES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./purchase-preferences.page').then((m) => m.PurchasePreferencesPageComponent),
    canDeactivate: [pendingChangesGuard],
    data: {
      meta: {
        title: 'Preferencias de compra',
        breadcrumb: 'Preferencias',
        icon: 'sliders-horizontal',
        permissions: ['manage:preferences']
      }
    }
  }
];
