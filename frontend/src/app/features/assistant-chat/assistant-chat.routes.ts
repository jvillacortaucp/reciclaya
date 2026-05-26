import { Route } from '@angular/router';

export const ASSISTANT_CHAT_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./presentation/assistant-chat.page').then((m) => m.AssistantChatPageComponent),
    data: {
      reuseView: true,
      reuseKey: 'assistant-chat',
      cacheTtlMs: 180000,
      meta: {
        title: 'Asistente ReciclaIA',
        breadcrumb: 'Asistente ReciclaIA',
        icon: 'messages'
      }
    }
  }
];
