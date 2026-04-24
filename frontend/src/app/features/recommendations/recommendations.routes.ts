import { Route } from '@angular/router';

export const RECOMMENDATIONS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./recommendations.page').then((m) => m.RecommendationsPageComponent),
    data: {
      meta: {
        title: 'Sector de valor',
        breadcrumb: 'Sector de valor',
        icon: 'sparkles',
        permissions: ['view:recommendations']
      }
    }
  }
];
