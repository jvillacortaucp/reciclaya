import { test, expect } from '../fixtures/auth.fixture';
import { PurchasePreferencesPage } from '../pages/purchase-preferences.page';

// ─────────────────────────────────────────────
// PC1–PC5: Preferencias de Compra (Registro Residuos para Compra)
// ─────────────────────────────────────────────

test.describe('Preferencias de Compra — Registro de Residuos', () => {

  test('PC1: buyer accede correctamente a /app/purchase-preferences', async ({ buyerPage }) => {
    const pp = new PurchasePreferencesPage(buyerPage);
    await pp.goto();
    await expect(buyerPage).toHaveURL('/app/purchase-preferences');
    // El formulario del Paso 1 debe estar visible (selector de tipo de residuo)
    await expect(buyerPage.locator('[formcontrolname="specificResidue"]')).toBeVisible();
  });

  test('PC2: seleccionar Tipo de Residuo orgánico actualiza el formulario', async ({ buyerPage }) => {
    const pp = new PurchasePreferencesPage(buyerPage);
    await pp.goto();

    // Tipo de residuo: el componente <app-residue-type-toggle> maneja el estado
    await pp.setResidueType('organic');

    // Verificamos que la opción seleccionada persiste comprobando la clase del botón
    const organicButton = buyerPage.locator('[data-testid="residue-type-organic"]');
    await expect(organicButton).toHaveClass(/bg-emerald-50/);
  });

  test('PC3: selector de Sector, Producto y Residuo Específico funcionan correctamente', async ({ buyerPage }) => {
    const pp = new PurchasePreferencesPage(buyerPage);
    await pp.goto();

    // Sector
    await pp.setSector('agro');
    await expect(buyerPage.locator('[formcontrolname="sector"]')).toHaveValue('agro');

    // Residuo específico (input libre con datalist)
    await pp.fillSpecificResidue('Cáscara de mango');
    await expect(buyerPage.locator('[formcontrolname="specificResidue"]')).toHaveValue('Cáscara de mango');
  });

  test('PC4: guardar preferencia muestra toast de confirmación', async ({ buyerPage }) => {
    const pp = new PurchasePreferencesPage(buyerPage);
    await pp.goto();

    // Llenar datos mínimos necesarios para guardar
    await pp.fillPreferenceForm({
      specificResidue:   'Cáscara de mango',
      requiredVolume:    '500',
      receivingLocation: 'Planta Lima Norte, Av. Industrial 123',
    });

    await pp.savePreference();

    // Debe aparecer el toast de confirmación
    await expect(pp.toastMessage).toBeVisible({ timeout: 8_000 });
  });

  test('PC5: tipo de intercambio, unidad y frecuencia se seleccionan correctamente', async ({ buyerPage }) => {
    const pp = new PurchasePreferencesPage(buyerPage);
    await pp.goto();

    await pp.setUnit('kg');
    await expect(buyerPage.locator('[formcontrolname="unit"]')).toHaveValue('kg');

    await pp.setPurchaseFrequency('monthly');
    await expect(buyerPage.locator('[formcontrolname="purchaseFrequency"]')).toHaveValue('monthly');

    await pp.setAcceptedExchangeType('sale');
    await expect(buyerPage.locator('[formcontrolname="acceptedExchangeType"]')).toHaveValue('sale');
  });

});
