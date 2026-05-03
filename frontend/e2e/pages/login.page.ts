import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly authError: Locator;
  readonly registerLink: Locator;
  readonly emailError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput   = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton  = page.locator('button[type="submit"]');
    this.authError     = page.locator('[data-testid="auth-error"]');
    this.registerLink  = page.locator('a[href="/auth/register"]');
    this.emailError    = page.locator('[data-testid="email-error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }
}
