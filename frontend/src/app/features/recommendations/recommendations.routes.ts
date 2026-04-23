import { Route } from '@angular/router';

export const RECOMMENDATIONS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./recommendations.page').then((m) => m.RecommendationsPageComponent),
    data: {
      meta: {
        title: 'Recomendaciones',
        breadcrumb: 'Recomendaciones',
        icon: 'sparkles',
        permissions: ['view:recommendations']
      }
    }
  }
];
