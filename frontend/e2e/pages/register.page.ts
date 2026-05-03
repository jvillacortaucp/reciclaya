import { Page, Locator } from '@playwright/test';

interface PersonFormData {
  firstName: string;
  lastName: string;
  documentNumber: string;
  mobilePhone: string;
  address: string;
  postalCode: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class RegisterPage {
  readonly authError: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.authError = page.locator('.text-amber-800, .bg-amber-50').first();
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  async selectNaturalPerson(): Promise<void> {
    await this.page.getByText('Natural person', { exact: true }).click();
  }


  async selectCompany(): Promise<void> {
    await this.page.locator('[data-testid="account-type-company"]').click();
  }

  async fillPersonForm(data: PersonFormData): Promise<void> {
    await this.page.fill('[formcontrolname="firstName"]', data.firstName);
    await this.page.fill('[formcontrolname="lastName"]', data.lastName);
    await this.page.fill('[formcontrolname="documentNumber"]', data.documentNumber);
    await this.page.fill('[formcontrolname="mobilePhone"]', data.mobilePhone);
    await this.page.fill('[formcontrolname="address"]', data.address);
    await this.page.fill('[formcontrolname="postalCode"]', data.postalCode);
    await this.page.fill('[formcontrolname="email"]', data.email);
    await this.page.fill('[formcontrolname="password"]', data.password);
    await this.page.fill('[formcontrolname="confirmPassword"]', data.confirmPassword);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  getFieldError(fieldName: string): Locator {
    return this.page.locator(`[data-testid="field-error-${fieldName}"]`);
  }

  getPasswordMismatchError(): Locator {
    return this.page.locator('[data-testid="password-mismatch-error"]');
  }
}
