# RevaloraIA Frontend Integration Guide

## Where to plug your final screens
- Auth login UI: `src/app/features/auth/login/login.page.html`
- Auth register UI: `src/app/features/auth/register/register.page.html`
- Dashboard widgets/charts: `src/app/features/dashboard/dashboard.page.html`
- Waste listing sell flow: `src/app/features/waste-sell/presentation/waste-sell.page.html`
- Purchase preferences flow: `src/app/features/purchase-preferences/presentation/purchase-preferences.page.html`
- Marketplace search/results: `src/app/features/marketplace/presentation/marketplace.page.html`
- Listing detail: `src/app/features/listing-detail/presentation/listing-detail.page.html`
- Pre-order creation: `src/app/features/pre-orders/presentation/pre-order-new.page.html`
- Pre-orders list: `src/app/features/pre-orders/presentation/pre-orders.page.html`
- Recommendations: `src/app/features/recommendations/recommendations.page.html`
- Profile: `src/app/features/profile/profile.page.ts`
- Settings: `src/app/features/settings/settings.page.ts`

## Data and state extension points
- Auth orchestration: `src/app/features/auth/services/auth.facade.ts`
- Marketplace orchestration: `src/app/features/marketplace/application/marketplace.facade.ts`
- Preferences orchestration: `src/app/features/purchase-preferences/application/purchase-preferences.facade.ts`
- Pre-orders orchestration: `src/app/features/pre-orders/application/pre-orders.facade.ts`
- Replace mocks with API adapters:
  - `src/app/features/**/infrastructure/*.repository.ts`
  - `src/assets/mocks/*.mock.ts`

## Cross-cutting extension points
- App routes and route metadata: `src/app/app.routes.ts`
- Sidebar navigation metadata: `src/app/core/constants/sidebar-nav.constants.ts`
- Guards: `src/app/core/guards/*.ts`
- Interceptors: `src/app/core/interceptors/*.ts`
- Theme/design tokens + motion: `src/styles.css`
