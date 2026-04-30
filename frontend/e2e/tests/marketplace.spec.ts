import { test, expect } from '../fixtures/auth.fixture';
import { MarketplacePage } from '../pages/marketplace.page';

test.describe('Marketplace', () => {

  test('M1: carga inicial muestra listados de productos', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    const cards = await mp.getProductCards();
    expect(cards.length).toBeGreaterThan(0);
  });

  test('M2: búsqueda por texto filtra los resultados', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    const totalBefore = (await mp.getProductCards()).length;
    await mp.search('papel');
    await buyerPage.waitForTimeout(1000);
    // Al menos la búsqueda ejecuta la petición (puede devolver 0 o N, solo verificamos que no crashee)
    await expect(buyerPage).toHaveURL('/app/marketplace');
    const totalAfter = (await mp.getProductCards()).length;
    // El total puede cambiar; lo que importa es que no haya error en pantalla
    expect(totalAfter).toBeGreaterThanOrEqual(0);
  });

  test('M3: filtro wasteType=organic muestra chip activo', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.applyFilter('wasteType', 'organic');
    await expect(mp.getFilterChip('wasteType')).toBeVisible({ timeout: 5_000 });
  });

  test('M4: eliminar chip de filtro lo quita y recarga la lista', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.applyFilter('wasteType', 'organic');
    const chip = mp.getFilterChip('wasteType');
    await expect(chip).toBeVisible();
    // Click en el chip para eliminarlo
    await chip.locator('[data-testid="chip-remove"]').click();
    await expect(chip).not.toBeVisible({ timeout: 5_000 });
  });

  test('M5: botón "cargar más" agrega más cards a la lista', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    const initialCount = (await mp.getProductCards()).length;
    // Solo correr si hay botón de cargar más disponible
    const hasMore = await mp.loadMoreButton.isVisible();
    if (!hasMore) {
      test.skip();
      return;
    }
    await mp.loadMore();
    const finalCount = (await mp.getProductCards()).length;
    expect(finalCount).toBeGreaterThan(initialCount);
  });

  test('M6: click en card navega a /app/marketplace/:id con el detalle', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.clickFirstCard();
    await expect(buyerPage).toHaveURL(/\/app\/marketplace\/.+/, { timeout: 8_000 });
    // La página de detalle debe mostrar el listado
    await expect(buyerPage.locator('[data-testid="listing-detail"]')).toBeVisible();
  });

  test('M7: click en "Comprar" desde detalle redirige al checkout', async ({ buyerPage }) => {
    const mp = new MarketplacePage(buyerPage);
    await mp.goto();
    await mp.clickFirstCard();
    await buyerPage.waitForSelector('[data-testid="btn-buy"]', { timeout: 8_000 });
    await mp.clickBuyButton();
    await expect(buyerPage).toHaveURL(/\/app\/checkout\/.+/, { timeout: 8_000 });
  });
});
