import { AppRoute } from './core/models/app.models';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { featureAccessMatchGuard } from './core/guards/feature-access.match-guard';
import { AppShellLayoutComponent } from './core/layouts/app-shell/app-shell-layout.component';

export const appRoutes: AppRoute[] = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/routes/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'marketplace',
    component: AppShellLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/marketplace/marketplace.routes').then((m) => m.MARKETPLACE_ROUTES)
      },
      {
        path: ':listingId',
        loadChildren: () =>
          import('./features/listing-detail/listing-detail.routes').then((m) => m.LISTING_DETAIL_ROUTES)
      }
    ]
  },
  {
    path: 'assistant-chat',
    component: AppShellLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/assistant-chat/assistant-chat.routes').then((m) => m.ASSISTANT_CHAT_ROUTES)
      }
    ]
  },
  {
    path: 'chat',
    pathMatch: 'full',
    redirectTo: 'assistant-chat'
  },
  {
    path: 'app',
    component: AppShellLayoutComponent,
    canMatch: [featureAccessMatchGuard],
    canActivate: [authGuard],
    canActivateChild: [permissionGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'waste-sell',
        loadChildren: () => import('./features/waste-sell/waste-sell.routes').then((m) => m.WASTE_SELL_ROUTES)
      },
      {
        path: 'my-listings',
        loadChildren: () =>
          import('./features/my-listings/my-listings.routes').then((m) => m.MY_LISTINGS_ROUTES)
      },
      {
        path: 'my-posts',
        pathMatch: 'full',
        redirectTo: 'my-listings'
      },
      {
        path: 'requests',
        loadChildren: () => import('./features/requests/requests.routes').then((m) => m.REQUESTS_ROUTES)
      },
      {
        path: 'purchase-preferences',
        loadChildren: () =>
          import('./features/purchase-preferences/purchase-preferences.routes').then(
            (m) => m.PURCHASE_PREFERENCES_ROUTES
          )
      },
      {
        path: 'marketplace',
        pathMatch: 'full',
        redirectTo: '/marketplace'
      },
      {
        path: 'marketplace/:listingId',
        redirectTo: '/marketplace/:listingId'
      },
      {
        path: 'pre-orders',
        loadChildren: () => import('./features/pre-orders/pre-orders.routes').then((m) => m.PRE_ORDERS_ROUTES)
      },
      {
        path: 'assistant-chat',
        pathMatch: 'full',
        redirectTo: '/assistant-chat'
      },
      {
        path: 'chat',
        pathMatch: 'full',
        redirectTo: '/assistant-chat'
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES)
      },
      {
        path: 'checkout',
        loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES)
      },
      {
        path: 'value-sector',
        loadChildren: () =>
          import('./features/value-sector/value-sector.routes').then((m) => m.VALUE_SECTOR_ROUTES)
      },
      {
        path: 'recommendations',
        loadChildren: () =>
          import('./features/recommendations/recommendations.routes').then((m) => m.RECOMMENDATIONS_ROUTES)
      },
      {
        path: 'messages',
        loadChildren: () => import('./features/messages/messages.routes').then((m) => m.MESSAGES_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'marketplace' },
  { path: '**', redirectTo: 'auth/login' }
];
