import { Route } from '@angular/router';

export const ASSISTANT_CHAT_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/assistant-chat.page').then((m) => m.AssistantChatPageComponent),
    data: {
      meta: {
        title: 'Asistente RevaloraIA',
        breadcrumb: 'Asistente RevaloraIA',
        icon: 'messages'
      }
    }
  }
];
