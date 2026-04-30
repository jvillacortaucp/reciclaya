import { test as base, Page } from '@playwright/test';
import { API_BASE_URL, TEST_USERS } from './test-data';

const SESSION_KEY = 'reciclaya.session';

/**
 * Hace login directamente contra la API y persiste la sesión en localStorage.
 * Evita repetir el flujo de UI en cada test.
 */
async function loginViaApi(page: Page, email: string, password: string): Promise<void> {
  const response = await page.request.post(`${API_BASE_URL}/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(
      `[auth.fixture] Login fallido para "${email}": HTTP ${response.status()} — ` +
      `¿El usuario existe en la BD de pruebas? Asegúrate de correr el seeder.`
    );
  }

  const body = await response.json();
  const session = body.data as Record<string, unknown>;

  // Navegar primero para que localStorage esté disponible
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: SESSION_KEY, value: session }
  );
}

// Extensión del test base con fixtures de usuario precargados
export const test = base.extend<{
  buyerPage: Page;
  sellerPage: Page;
  adminPage: Page;
}>({
  buyerPage: async ({ page }, use) => {
    await loginViaApi(page, TEST_USERS.buyer.email, TEST_USERS.buyer.password);
    await use(page);
  },
  sellerPage: async ({ page }, use) => {
    await loginViaApi(page, TEST_USERS.seller.email, TEST_USERS.seller.password);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await loginViaApi(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
