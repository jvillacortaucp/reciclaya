import { expect } from '@playwright/test';
import { test, } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';


// Usuarios y contraseñas validas e invalidas para los tests
const customAccounts = [
  { email: 'dohibob179@4heats.com', password: 'dohibob179@4heats.com' },
  { email: 'eddutulokito69@gmail.com', password: '<script>alert(0);</script>' },
  { email: 'kmdkfmskdmkmkmkdmk@4heats.com', password: '<scritp>alert(0)</scritp>' },
  { email: 'locaso1@gduko.porn', password: '<script>alert(0);</script>' }
];

// Usuarios falsos para verificar que no se pueda iniciar sesión
const cuentas_fakes = [
  { email: 'oño@tulokito.com', password: 'dLocasookay' },
  { email: 'locaso1@gduko.porn', password: '<script>alert(0);</script>' }
]

const cuentas_raras = [
  { email: 'eddutulokito69', password: '<script>alert(0);</script>/' },
  { email: 'kmdkfmskdmkmkmkdmk@4heats', password: '<scritp>alert(0)</scritp>jaskdaksjd' }
];


test.describe('Auth — Login', () => {
  for (const account of customAccounts) {
    test(`A1.1: Login  (${account.email.substring(0, 15)}...) redirige a dashboard`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(account.email, account.password);
      await expect(page).toHaveURL('/app/dashboard', { timeout: 10_000 });
    });
  }


  // Email invalido
  for (const account of cuentas_fakes) {
    test(`A2: email ${account.email.substring(0, 10)}... muestra error en campo antes de submit`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.fillEmail(account.email);
      await loginPage.fillPassword(account.password);

      await expect(loginPage.submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });
  }




  for (const account of cuentas_raras) {
    test(`A2.1: Intento de login con correo incompleto (${account.email.substring(0, 15)}...)`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.fillEmail(account.email);
      await loginPage.fillPassword(account.password);
      await expect(loginPage.submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });
  }

  test('A3: credenciales incorrectas muestran error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('noexiste@test.com', 'WrongPass999!');
    await expect(loginPage.authError).toBeVisible({ timeout: 8_000 });
    await expect(loginPage.authError).toContainText(/credencial|invalid/i);
  });

  test('A4: GuestGuard redirige a /app/dashboard si ya está autenticado', async ({ buyerPage }) => {
    await buyerPage.goto('/auth/login');
    await expect(buyerPage).toHaveURL('/app/dashboard', { timeout: 5_000 });
  });
});