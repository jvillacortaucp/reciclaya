import { Page, Locator } from '@playwright/test';

export class WasteSellPage {
  readonly saveDraftButton: Locator;
  readonly publishButton: Locator;
  readonly generateIdeasButton: Locator;
  readonly toastMessage: Locator;
  readonly previewCompletion: Locator;
  readonly confirmDialog: Locator;

  constructor(private readonly page: Page) {
    this.saveDraftButton     = page.locator('[data-testid="btn-save-draft"]');
    this.publishButton       = page.locator('[data-testid="btn-publish"]');
    this.generateIdeasButton = page.locator('[data-testid="btn-generate-ideas"]');
    this.toastMessage        = page.locator('[data-testid="toast-message"]');
    this.previewCompletion   = page.locator('[data-testid="preview-completion"]');
    this.confirmDialog       = page.locator('[data-testid="confirm-dialog"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/waste-sell');
  }

  async fillResidueType(value: string): Promise<void> {
    await this.page.locator('[formcontrolname="residueType"]').selectOption(value);
  }

  async fillSector(value: string): Promise<void> {
    await this.page.locator('[formcontrolname="sector"]').selectOption(value);
  }

  async fillDescription(text: string): Promise<void> {
    await this.page.fill('[formcontrolname="shortDescription"]', text);
  }

  async fillSpecificResidue(text: string): Promise<void> {
    await this.page.fill('[formcontrolname="specificResidue"]', text);
  }

  async fillQuantity(qty: string): Promise<void> {
    await this.page.fill('[formcontrolname="quantity"]', qty);
  }

  async fillAddress(address: string): Promise<void> {
    await this.page.fill('[formcontrolname="warehouseAddress"]', address);
  }

  async saveDraft(): Promise<void> {
    await this.saveDraftButton.click();
  }

  async publish(): Promise<void> {
    await this.publishButton.click();
  }

  async generateIdeas(): Promise<void> {
    await this.generateIdeasButton.click();
  }

  async getCompletionPercentage(): Promise<number> {
    const text = await this.previewCompletion.innerText();
    return parseInt(text.replace('%', ''), 10);
  }

  async navigateAway(navSelector: string): Promise<void> {
    await this.page.locator(navSelector).click();
  }

  getIdeasList(): Locator {
    return this.page.locator('[data-testid="valorization-ideas-list"]');
  }

  getStaleIdeasBanner(): Locator {
    return this.page.locator('[data-testid="ideas-stale-banner"]');
  }
}
