import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register.page';
import { TEST_USERS } from '../fixtures/test-data';


test.describe('Auth — Registro', () => {

    test('A5: registro con datos válidos redirige a /app/dashboard', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await page.getByText('Natural person', { exact: true }).click();
        await registerPage.fillPersonForm({
            firstName: 'Test',
            lastName: 'E2E',
            documentNumber: `${Math.floor(10000000 + Math.random() * 90000000)}`,
            mobilePhone: '987654321',
            address: 'Calle Test 123',
            postalCode: '15001',
            email: `e2e_${Date.now()}@test.com`,
            password: 'Test1234!',
            confirmPassword: 'Test1234!',
        });
        await registerPage.submit();
        await expect(page).toHaveURL('/app/dashboard', { timeout: 10_000 });
    });

    test('A6: DNI con letras activa error de validación y bloquea envío', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.selectNaturalPerson();
        await page.fill('[formcontrolname="documentNumber"]', 'ABCDEFGH');
        await registerPage.submit();
        await expect(registerPage.getFieldError('documentNumber')).toBeVisible();
        await expect(page).toHaveURL('/auth/register'); // no navegó
    });

    test('A7: passwords no coincidentes muestran error de mismatch', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.selectNaturalPerson();
        await page.fill('[formcontrolname="firstName"]', 'Test');
        await page.fill('[formcontrolname="lastName"]', 'E2E');
        await page.fill('[formcontrolname="documentNumber"]', '12345678');
        await page.fill('[formcontrolname="mobilePhone"]', '987654321');
        await page.fill('[formcontrolname="address"]', 'Calle 123');
        await page.fill('[formcontrolname="postalCode"]', '15001');
        await page.fill('[formcontrolname="email"]', `mismatch_${Date.now()}@test.com`);
        await page.fill('[formcontrolname="password"]', 'Test1234!');
        await page.fill('[formcontrolname="confirmPassword"]', 'Diferente999!');
        await registerPage.submit();
        await expect(registerPage.getPasswordMismatchError()).toBeVisible();
        await expect(page).toHaveURL('/auth/register');
    });

    test('A8: email ya registrado → API 409 muestra mensaje de error', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.selectNaturalPerson();
        await registerPage.fillPersonForm({
            firstName: 'Duplicado',
            lastName: 'Test',
            documentNumber: `${Math.floor(10000000 + Math.random() * 90000000)}`,
            mobilePhone: '987654321',
            address: 'Calle 123',
            postalCode: '15001',
            email: TEST_USERS.buyer.email, // email YA existente
            password: 'Test1234!',
            confirmPassword: 'Test1234!',
        });
        await registerPage.submit();
        await expect(registerPage.authError).toBeVisible({ timeout: 8_000 });
        await expect(registerPage.authError).toContainText(/email|registrado|exist/i);
    });
});