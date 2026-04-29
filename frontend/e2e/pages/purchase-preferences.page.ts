import { Page, Locator } from '@playwright/test';

export interface PurchasePreferenceFormData {
  residueType?: 'organic' | 'inorganic';
  sector?: string;
  productType?: string;
  specificResidue?: string;
  requiredVolume?: string;
  unit?: string;
  purchaseFrequency?: string;
  minPriceUsd?: string;
  maxPriceUsd?: string;
  receivingLocation?: string;
  preferredMode?: string;
  acceptedExchangeType?: string;
}

export class PurchasePreferencesPage {
  readonly toastMessage: Locator;
  readonly saveButton: Locator;
  readonly activateAlertButton: Locator;
  readonly previewButton: Locator;

  constructor(private readonly page: Page) {
    this.toastMessage         = page.locator('[data-testid="toast-message"]');
    // Los botones no tienen data-testid en el HTML; usamos texto estático
    this.saveButton           = page.locator('button', { hasText: /Guardar|Guardando/i });
    this.activateAlertButton  = page.locator('button', { hasText: /Activar|Activando/i });
    this.previewButton        = page.locator('button', { hasText: /Vista previa/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/purchase-preferences');
  }

  /** Selecciona el tipo de residuo usando el componente toggle */
  async setResidueType(type: 'organic' | 'inorganic'): Promise<void> {
    // El componente <app-residue-type-toggle> renderiza botones o inputs
    await this.page.locator(`[data-testid="residue-type-${type}"]`).click();
  }

  /** Selecciona el sector desde el <select formControlName="sector"> */
  async setSector(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="sector"]', value);
  }

  /** Selecciona el producto fuente */
  async setProductType(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="productType"]', value);
  }

  /** Llena el residuo específico */
  async fillSpecificResidue(text: string): Promise<void> {
    await this.page.fill('[formcontrolname="specificResidue"]', text);
  }

  /** Llena el volumen requerido */
  async fillRequiredVolume(volume: string): Promise<void> {
    await this.page.fill('[formcontrolname="requiredVolume"]', volume);
  }

  /** Selecciona la unidad */
  async setUnit(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="unit"]', value);
  }

  /** Selecciona la frecuencia de compra */
  async setPurchaseFrequency(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="purchaseFrequency"]', value);
  }

  /** Llena el rango de precio */
  async fillPriceRange(min: string, max: string): Promise<void> {
    await this.page.fill('[formcontrolname="minPriceUsd"]', min);
    await this.page.fill('[formcontrolname="maxPriceUsd"]', max);
  }

  /** Llena la ubicación de recepción */
  async fillReceivingLocation(location: string): Promise<void> {
    await this.page.fill('[formcontrolname="receivingLocation"]', location);
  }

  /** Selecciona la modalidad preferida */
  async setPreferredMode(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="preferredMode"]', value);
  }

  /** Selecciona el tipo de intercambio aceptado */
  async setAcceptedExchangeType(value: string): Promise<void> {
    await this.page.selectOption('[formcontrolname="acceptedExchangeType"]', value);
  }

  /** Activa/desactiva el checkbox de alertas en coincidencias */
  async toggleAlertOnMatch(): Promise<void> {
    await this.page.locator('[formcontrolname="alertOnMatch"]').click();
  }

  /** Llena el formulario completo con los datos proporcionados */
  async fillPreferenceForm(data: PurchasePreferenceFormData): Promise<void> {
    if (data.residueType)        await this.setResidueType(data.residueType);
    if (data.sector)             await this.setSector(data.sector);
    if (data.productType)        await this.setProductType(data.productType);
    if (data.specificResidue)    await this.fillSpecificResidue(data.specificResidue);
    if (data.requiredVolume)     await this.fillRequiredVolume(data.requiredVolume);
    if (data.unit)               await this.setUnit(data.unit);
    if (data.purchaseFrequency)  await this.setPurchaseFrequency(data.purchaseFrequency);
    if (data.minPriceUsd && data.maxPriceUsd) {
      await this.fillPriceRange(data.minPriceUsd, data.maxPriceUsd);
    }
    if (data.receivingLocation)  await this.fillReceivingLocation(data.receivingLocation);
    if (data.preferredMode)      await this.setPreferredMode(data.preferredMode);
    if (data.acceptedExchangeType) await this.setAcceptedExchangeType(data.acceptedExchangeType);
  }

  /** Guarda la preferencia */
  async savePreference(): Promise<void> {
    await this.saveButton.click();
  }

  /** Activa la alerta de coincidencias */
  async activateAlert(): Promise<void> {
    await this.activateAlertButton.click();
  }
}
