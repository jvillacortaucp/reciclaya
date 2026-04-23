import { Route } from '@angular/router';

export const MESSAGES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./messages.page').then((m) => m.MessagesPageComponent),
    data: {
      meta: {
        title: 'Mensajes',
        breadcrumb: 'Mensajes',
        icon: 'messages',
        permissions: ['view:messages']
      }
    }
  }
];
