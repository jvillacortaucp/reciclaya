import { Route } from '@angular/router';

export const RECOMMENDATIONS_ROUTES: Route[] = [
  {
    path: ':productId',
    loadComponent: () => import('./recommendations.page').then((m) => m.RecommendationsPageComponent),
    data: {
      meta: {
        title: 'Motor de recomendaciones',
        breadcrumb: 'Motor de recomendaciones',
        icon: 'sparkles',
        permissions: ['view:recommendations']
      }
    }
  },
  {
    path: '',
    loadComponent: () => import('./recommendations.page').then((m) => m.RecommendationsPageComponent),
    data: {
      meta: {
        title: 'Motor de recomendaciones',
        breadcrumb: 'Motor de recomendaciones',
        icon: 'sparkles',
        permissions: ['view:recommendations']
      }
    }
  }
];
