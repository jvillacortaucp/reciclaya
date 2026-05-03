import { Page, Locator } from '@playwright/test';

type PaymentMethod = 'card' | 'yape' | 'bank_transfer';
type SimulateResult = 'approved' | 'rejected';

interface CardData {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
}

export class CheckoutPage {
  readonly orderSummary: Locator;
  readonly confirmPaymentButton: Locator;
  readonly paymentStatus: Locator;
  readonly goToOrdersButton: Locator;
  readonly toastMessage: Locator;
  readonly pricingBreakdown: Locator;

  constructor(private readonly page: Page) {
    this.orderSummary        = page.locator('[data-testid="order-summary"]');
    this.confirmPaymentButton = page.locator('[data-testid="btn-confirm-payment"]');
    this.paymentStatus       = page.locator('[data-testid="payment-status"]');
    this.goToOrdersButton    = page.locator('[data-testid="btn-go-orders"]');
    this.toastMessage        = page.locator('[data-testid="toast-message"]');
    this.pricingBreakdown    = page.locator('[data-testid="pricing-breakdown"]');
  }

  async goto(listingId: string): Promise<void> {
    await this.page.goto(`/app/checkout/${listingId}`);
    await this.orderSummary.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    await this.page.locator(`[data-testid="payment-method-${method}"]`).click();
  }

  async fillCard(data: CardData): Promise<void> {
    await this.page.fill('[data-testid="card-number"]',  data.number);
    await this.page.fill('[data-testid="card-holder"]',  data.holder);
    await this.page.fill('[data-testid="card-month"]',   data.month);
    await this.page.fill('[data-testid="card-year"]',    data.year);
    await this.page.fill('[data-testid="card-cvv"]',     data.cvv);
  }

  async setSimulateResult(result: SimulateResult): Promise<void> {
    await this.page.locator(`[data-testid="simulate-${result}"]`).click();
  }

  async confirmPayment(): Promise<void> {
    await this.confirmPaymentButton.click();
    // Esperar respuesta del backend
    await this.paymentStatus.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async getPaymentStatusText(): Promise<string> {
    return this.paymentStatus.innerText();
  }

  async goToOrders(): Promise<void> {
    await this.goToOrdersButton.click();
  }

  getSuccessView(): Locator {
    return this.page.locator('[data-testid="payment-success-view"]');
  }

  getRejectedView(): Locator {
    return this.page.locator('[data-testid="payment-rejected-view"]');
  }
}
