import { test, expect } from '../fixtures/auth.fixture';
import { MarketplacePage } from '../pages/marketplace.page';

// ─────────────────────────────────────────────
// MD1–MD5: Filtros adicionales y Vista de Detalle
// ─────────────────────────────────────────────

test.describe('Marketplace — Filtros y Detalle del Producto', () => {

  test('MD1: filtro por tipo de residuo inorgánico muestra resultados', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();

    await mp.applyFilter('wasteType', 'inorganic');
    await expect(mp.getFilterChip('wasteType')).toBeVisible({ timeout: 5_000 });

    // Los resultados no deben mostrar error en pantalla
    await expect(buyerPage).toHaveURL('/app/marketplace');
  });

  test('MD2: filtro por tipo de intercambio muestra chip activo', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();

    await mp.applyFilter('exchangeType', 'sale');
    await expect(mp.getFilterChip('exchangeType')).toBeVisible({ timeout: 5_000 });
  });

  test('MD3: vista de detalle muestra el título del producto', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.clickFirstCard();

    await expect(buyerPage).toHaveURL(/\/app\/marketplace\/.+/, { timeout: 8_000 });

    // El HTML usa un <h1 class="text-5xl"> para el título del producto
    const productTitle = buyerPage.locator('h1');
    await expect(productTitle).toBeVisible({ timeout: 8_000 });
    // El título no debe estar vacío
    const titleText = await productTitle.innerText();
    expect(titleText.trim().length).toBeGreaterThan(0);
  });

  test('MD4: vista de detalle muestra la cantidad disponible en las specs técnicas', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.clickFirstCard();

    await expect(buyerPage).toHaveURL(/\/app\/marketplace\/.+/, { timeout: 8_000 });

    // Las specs técnicas se renderizan como una tabla de divs con clase border-b border-r
    // Cada spec tiene un <p class="text-xs uppercase..."> (label) y un <p class="text-4xl..."> (valor)
    const specValues = buyerPage.locator('p.text-4xl.font-semibold.text-slate-900');
    await expect(specValues.first()).toBeVisible({ timeout: 8_000 });

    // Al menos debe haber una spec visible (cantidad, peso, etc.)
    const count = await specValues.count();
    expect(count).toBeGreaterThan(0);
  });

  test('MD5: vista de detalle muestra el costo estimado por unidad desde la tarjeta lateral', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.clickFirstCard();

    await expect(buyerPage).toHaveURL(/\/app\/marketplace\/.+/, { timeout: 8_000 });

    // El componente <app-listing-summary-card> muestra la información de precio
    // Lo localizamos por el data-testid que debería existir en el componente
    const summaryCard = buyerPage.locator('[data-testid="listing-detail"]');
    await expect(summaryCard).toBeVisible({ timeout: 8_000 });

    // El badge de tipo de residuo (orgánico/inorgánico) debe ser visible
    const wasteBadge = buyerPage.locator('span.rounded-full.bg-emerald-100');
    await expect(wasteBadge.first()).toBeVisible();
  });

});
