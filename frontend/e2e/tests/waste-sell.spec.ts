import { test, expect } from '../fixtures/auth.fixture';
import { WasteSellPage } from '../pages/waste-sell.page';

test.describe('Waste-Sell', () => {

  test('W1: seller accede correctamente a /app/waste-sell', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    await expect(sellerPage).toHaveURL('/app/waste-sell');
    // El formulario está visible
    await expect(sellerPage.locator('[formcontrolname="shortDescription"]')).toBeVisible();
  });

  test('W2: buyer sin permiso manage:waste es redirigido a /app/dashboard', async ({ buyerPage }) => {
    // Buyer tiene view:marketplace pero NO manage:waste
    await buyerPage.goto('/app/waste-sell');
    await expect(buyerPage).toHaveURL('/app/dashboard', { timeout: 5_000 });
  });

  test('W3: cambiar campos actualiza el porcentaje de completitud del preview', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    const initialCompletion = await wasteSell.getCompletionPercentage();

    await wasteSell.fillDescription('Papel de oficina reciclado tipo A');
    await wasteSell.fillSpecificResidue('Papel bond');
    await wasteSell.fillQuantity('500');
    await wasteSell.fillAddress('Av. Industriales 1234, Lima');

    await sellerPage.waitForTimeout(1500); // Espera el preview refresh (HTTP)
    const updatedCompletion = await wasteSell.getCompletionPercentage();
    expect(updatedCompletion).toBeGreaterThan(initialCompletion);
  });

  test('W4: guardar borrador muestra toast de confirmación', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    await wasteSell.fillDescription('Borrador de prueba E2E');
    await wasteSell.saveDraft();
    await expect(wasteSell.toastMessage).toBeVisible({ timeout: 8_000 });
    await expect(wasteSell.toastMessage).toContainText(/borrador/i);
  });

  test('W5: generar ideas IA muestra lista de ideas de valorización', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    // Completar campos mínimos para generar ideas
    await wasteSell.fillDescription('Cáscara de frutas húmeda');
    await wasteSell.fillSpecificResidue('Cáscara de mango');
    await wasteSell.fillQuantity('200');
    await wasteSell.generateIdeas();
    await expect(wasteSell.getIdeasList()).toBeVisible({ timeout: 15_000 });
  });

  test('W6: publicar muestra toast de éxito y actualiza status', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    await wasteSell.fillDescription('Listado para publicar E2E');
    await wasteSell.fillSpecificResidue('Metal ferroso');
    await wasteSell.fillQuantity('1000');
    await wasteSell.fillAddress('Planta Industrial, Callao');
    await wasteSell.publish();
    await expect(wasteSell.toastMessage).toBeVisible({ timeout: 8_000 });
    await expect(wasteSell.toastMessage).toContainText(/publicado/i);
  });

  test('W7: salir con cambios sin guardar muestra diálogo de confirmación', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();
    // Hacer un cambio sin guardar
    await wasteSell.fillDescription('Cambio sin guardar');
    // Intentar navegar a dashboard via el sidebar
    await sellerPage.locator('[data-testid="nav-dashboard"]').click();
    // El pendingChangesGuard debe interceptar y mostrar el diálogo
    await expect(wasteSell.confirmDialog).toBeVisible({ timeout: 5_000 });
    // Confirmar salida
    await sellerPage.locator('[data-testid="confirm-leave"]').click();
    await expect(sellerPage).toHaveURL('/app/dashboard');
  });
});
