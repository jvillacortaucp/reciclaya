import { Route } from '@angular/router';

export const VALUE_SECTOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./value-sector.page').then((m) => m.ValueSectorPageComponent),
    data: {
      meta: {
        title: 'Sector de valor',
        breadcrumb: 'Sector de valor',
        icon: 'sparkles',
        permissions: ['view:value-sector']
      }
    }
  }
];
