import { Page, Locator } from '@playwright/test';

export class MarketplacePage {
  readonly searchInput: Locator;
  readonly loadMoreButton: Locator;
  readonly toastMessage: Locator;

  constructor(private readonly page: Page) {
    this.searchInput    = page.locator('[data-testid="search-input"]');
    this.loadMoreButton = page.locator('[data-testid="btn-load-more"]');
    this.toastMessage   = page.locator('[data-testid="toast-message"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/app/marketplace');
    // Esperar a que carguen los cards
    await this.page.waitForSelector('[data-testid="product-card"]', { timeout: 10_000 });
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500); // debounce de búsqueda
  }

  async applyFilter(filterName: string, value: string): Promise<void> {
    await this.page.locator(`[data-testid="filter-${filterName}"]`).selectOption(value);
    await this.page.waitForTimeout(500);
  }

  async clearFilters(): Promise<void> {
    await this.page.locator('[data-testid="btn-clear-filters"]').click();
  }

  async getProductCards(): Promise<Locator[]> {
    return this.page.locator('[data-testid="product-card"]').all();
  }

  async clickFirstCard(): Promise<void> {
    await this.page.locator('[data-testid="product-card"]').first().click();
  }

  async clickBuyButton(): Promise<void> {
    await this.page.locator('[data-testid="btn-buy"]').click();
  }

  async loadMore(): Promise<void> {
    await this.loadMoreButton.click();
    await this.page.waitForTimeout(1000);
  }

  getFilterChip(filterKey: string): Locator {
    return this.page.locator(`[data-testid="chip-${filterKey}"]`);
  }

  getEmptyState(): Locator {
    return this.page.locator('[data-testid="empty-state"]');
  }

  getRecommendedSection(): Locator {
    return this.page.locator('[data-testid="recommended-section"]');
  }
}
