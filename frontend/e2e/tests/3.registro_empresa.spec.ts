import { test, expect } from '@playwright/test';
import { CompanyRegisterPage } from '../pages/company-register.page';
import { TEST_USERS } from '../fixtures/test-data';

// ─────────────────────────────────────────────
// RE1–RE4: Registro Empresa (2 pasos)
// ─────────────────────────────────────────────

// Datos base de la empresa para reutilizar en varios tests
const companyData = {
  ruc: '206012345677654',
  businessName: 'RevaloraIA S.A.C.',
  mobilePhone: '987654321',
  address: 'Av. Industriales 1234, Lima',
  postalCode: '15001',
  legalRepresentative: 'Carlos Pérez',
  position: 'Gerente General',
};

const credentialsData = {
  intent: 'sell',
  email: `5empresa_${Date.now()}@test.com`,
  password: 'Test1234!',
  confirmPassword: 'Test1234!',
};


test.describe('Registro — Empresa', () => {

  test('RE1: registro completo de empresa (2 pasos) redirige a /app/dashboard', async ({ page }) => {
    const registerPage = new CompanyRegisterPage(page);
    await registerPage.registerCompany(
      { ...companyData, ruc: `${Math.floor(20000000000 + Math.random() * 9999999999)}` },
      {
        ...credentialsData,
        // Email único para evitar conflictos de BD entre ejecuciones
        email: `empresa_re1_${Date.now()}@test.com`,
      }
    );
    await expect(page).toHaveURL('/app/dashboard', { timeout: 12_000 });
  });

  test('RE2: RUC con menos de 11 dígitos bloquea avance al Paso 2', async ({ page }) => {
    const registerPage = new CompanyRegisterPage(page);
    await registerPage.goto();
    await registerPage.selectCompany();

    // RUC inválido (menos de 11 dígitos)
    await registerPage.fillCompanyData({ ...companyData, ruc: '2060123' });
    await registerPage.goNext();

    // El formulario debe mostrar error en RUC y NO avanzar al Paso 2
    await expect(registerPage.getFieldError('ruc')).toBeVisible();
    // Verificamos que seguimos en el Paso 1 (el botón "Continuar" sigue visible)
    await expect(registerPage.continueButton).toBeVisible();
  });

  test('RE3: passwords no coincidentes en Paso 2 muestran error de mismatch', async ({ page }) => {
    const registerPage = new CompanyRegisterPage(page);
    await registerPage.goto();
    await registerPage.selectCompany();
    await registerPage.fillCompanyData({
      ...companyData,
      ruc: `${Math.floor(20000000000 + Math.random() * 9999999999)}`,
    });
    await registerPage.goNext();

    await registerPage.fillCredentials({
      intent: 'sell',
      email: `mismatch_empresa_${Date.now()}@test.com`,
      password: 'Test1234!',
      confirmPassword: 'OtraPassword999!', // No coincide
    });
    await registerPage.submit();

    await expect(registerPage.getPasswordMismatchError()).toBeVisible();
    // No navega al dashboard
    await expect(page).toHaveURL('/auth/register');
  });

  test('RE4: email de empresa ya registrado → API 409 muestra error', async ({ page }) => {
    const registerPage = new CompanyRegisterPage(page);
    await registerPage.goto();
    await registerPage.selectCompany();
    await registerPage.fillCompanyData({
      ...companyData,
      ruc: `${Math.floor(20000000000 + Math.random() * 9999999999)}`, // RUC único
    });
    await registerPage.goNext();

    await registerPage.fillCredentials({
      intent: 'sell',
      email: TEST_USERS.buyer.email, // email YA existente
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
    });
    await registerPage.submit();

    await expect(registerPage.authError).toBeVisible({ timeout: 8_000 });
    await expect(registerPage.authError).toContainText(/email|registrado|exist/i);
  });

});
