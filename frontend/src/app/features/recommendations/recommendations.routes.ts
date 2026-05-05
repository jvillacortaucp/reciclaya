import { Route } from '@angular/router';

export const RECOMMENDATIONS_ROUTES: Route[] = [
  {
    path: 'history',
    loadComponent: () =>
      import('./presentation/pages/recommendations-history.page').then((m) => m.RecommendationsHistoryPageComponent),
    data: {
      meta: {
        title: 'Ideas guardadas',
        breadcrumb: 'Ideas guardadas',
        icon: 'history',
        permissions: ['view:recommendations']
      }
    }
  },
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
