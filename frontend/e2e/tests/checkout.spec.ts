import { test, expect } from '../fixtures/auth.fixture';
import { CheckoutPage } from '../pages/checkout.page';
import { TEST_LISTING_ID } from '../fixtures/test-data';

test.describe('Checkout', () => {

  test('C1: buyer llega a checkout y ve resumen de la orden', async ({ buyerPage }) => {
    const checkout = new CheckoutPage(buyerPage);
    await checkout.goto(TEST_LISTING_ID);
    await expect(checkout.orderSummary).toBeVisible();
    // Verificar que muestra el desglose de precios
    await expect(checkout.pricingBreakdown).toBeVisible();
  });

  test('C2: pago con tarjeta simulado como "approved" muestra vista de éxito', async ({ buyerPage }) => {
    const checkout = new CheckoutPage(buyerPage);
    await checkout.goto(TEST_LISTING_ID);
    await checkout.selectPaymentMethod('card');
    await checkout.fillCard({
      number: '4111111111111111',
      holder: 'Juan Perez E2E',
      month: '12',
      year: '2027',
      cvv: '123',
    });
    await checkout.setSimulateResult('approved');
    await checkout.confirmPayment();
    await expect(checkout.getSuccessView()).toBeVisible({ timeout: 15_000 });
    const statusText = await checkout.getPaymentStatusText();
    expect(statusText.toLowerCase()).toContain('approved');
  });

  test('C3: pago simulado como "rejected" muestra vista de rechazo', async ({ buyerPage }) => {
    const checkout = new CheckoutPage(buyerPage);
    await checkout.goto(TEST_LISTING_ID);
    await checkout.selectPaymentMethod('card');
    await checkout.fillCard({
      number: '4000000000000002', // número de tarjeta para rechazo
      holder: 'Rechazado Test',
      month: '01',
      year: '2026',
      cvv: '000',
    });
    await checkout.setSimulateResult('rejected');
    await checkout.confirmPayment();
    await expect(checkout.getRejectedView()).toBeVisible({ timeout: 15_000 });
    const statusText = await checkout.getPaymentStatusText();
    expect(statusText.toLowerCase()).toContain('rejected');
  });

  test('C4: desde vista de éxito, "Ver mis órdenes" navega a /app/orders', async ({ buyerPage }) => {
    const checkout = new CheckoutPage(buyerPage);
    await checkout.goto(TEST_LISTING_ID);
    await checkout.selectPaymentMethod('yape');
    await checkout.setSimulateResult('approved');
    await checkout.confirmPayment();
    await expect(checkout.getSuccessView()).toBeVisible({ timeout: 15_000 });
    await checkout.goToOrders();
    await expect(buyerPage).toHaveURL('/app/orders', { timeout: 5_000 });
  });

  test('C5: seller (sin rol buyer) no puede acceder al checkout', async ({ sellerPage }) => {
    // El permissionGuard requiere roles: ['buyer', 'admin']
    await sellerPage.goto(`/app/checkout/${TEST_LISTING_ID}`);
    // Debe ser redirigido al dashboard
    await expect(sellerPage).toHaveURL('/app/dashboard', { timeout: 5_000 });
  });
});
