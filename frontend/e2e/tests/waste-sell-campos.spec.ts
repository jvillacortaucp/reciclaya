import { test, expect } from '../fixtures/auth.fixture';
import { WasteSellPage } from '../pages/waste-sell.page';

// ─────────────────────────────────────────────
// WC1–WC5: Campos faltantes del formulario de venta
// ─────────────────────────────────────────────

test.describe('Waste-Sell — Campos del Formulario', () => {

  test('WC1: selector de unidad de medida cambia correctamente', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();

    // Selecciona toneladas
    await sellerPage.locator('[formcontrolname="unit"]').selectOption('ton');
    await expect(sellerPage.locator('[formcontrolname="unit"]')).toHaveValue('ton');

    // Cambia a kilogramos
    await sellerPage.locator('[formcontrolname="unit"]').selectOption('kg');
    await expect(sellerPage.locator('[formcontrolname="unit"]')).toHaveValue('kg');
  });

  test('WC2: frecuencia de generación se puede seleccionar', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();

    await sellerPage.locator('[formcontrolname="generationFrequency"]').selectOption('monthly');
    await expect(sellerPage.locator('[formcontrolname="generationFrequency"]')).toHaveValue('monthly');
  });

  test('WC3: tipo de intercambio acepta venta, trueque y recojo', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();

    const exchangeSelector = sellerPage.locator('[formcontrolname="exchangeType"]');

    await exchangeSelector.selectOption('sale');
    await expect(exchangeSelector).toHaveValue('sale');

    await exchangeSelector.selectOption('barter');
    await expect(exchangeSelector).toHaveValue('barter');

    await exchangeSelector.selectOption('pickup');
    await expect(exchangeSelector).toHaveValue('pickup');
  });

  test('WC4: modalidad de entrega se selecciona correctamente', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();

    await sellerPage.locator('[formcontrolname="deliveryMode"]').selectOption('pickup');
    await expect(sellerPage.locator('[formcontrolname="deliveryMode"]')).toHaveValue('pickup');
  });

  test('WC5: costo unitario calcula el total estimado con la cantidad ingresada', async ({ sellerPage }) => {
    const wasteSell = new WasteSellPage(sellerPage);
    await wasteSell.goto();

    // Ingresar cantidad y costo para que se calcule el total
    await wasteSell.fillQuantity('100');
    await sellerPage.fill('[formcontrolname="estimatedCostPerUnit"]', '5');

    // El total estimado debe aparecer (100 * 5 = $500.00 USD)
    // Locator basado en el HTML: strong con clase text-green-800 dentro del bloque de precio total
    const totalLabel = sellerPage.locator('strong.text-green-800');
    await expect(totalLabel).toBeVisible();
    await expect(totalLabel).toContainText('500.00');
  });

});
