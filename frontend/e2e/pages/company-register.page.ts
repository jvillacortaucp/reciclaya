import { Page, Locator } from '@playwright/test';

export interface CompanyFormData {
  ruc: string;
  businessName: string;
  mobilePhone: string;
  address: string;
  postalCode: string;
  legalRepresentative: string;
  position: string;
}

export interface CompanyCredentialsData {
  intent: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class CompanyRegisterPage {
  readonly authError: Locator;
  readonly continueButton: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.authError = page.locator('.bg-amber-50.text-amber-800');
    this.continueButton = page.locator('button[type="button"]', { hasText: 'Continuar' });
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  async selectCompany(): Promise<void> {
    await this.page.locator('[data-testid="account-type-company"]').click();
  }

  /** Rellena todos los campos del Paso 1 */
  async fillCompanyData(data: CompanyFormData): Promise<void> {
    await this.page.fill('[formcontrolname="ruc"]', data.ruc);
    await this.page.fill('[formcontrolname="mobilePhone"]', data.mobilePhone);
    await this.page.fill('[formcontrolname="businessName"]', data.businessName);
    await this.page.fill('[formcontrolname="address"]', data.address);
    await this.page.fill('[formcontrolname="postalCode"]', data.postalCode);
    await this.page.fill('[formcontrolname="legalRepresentative"]', data.legalRepresentative);
    await this.page.fill('[formcontrolname="position"]', data.position);
  }

  /** Avanza al Paso 2 */
  async goNext(): Promise<void> {
    await this.continueButton.click();
  }

  /** Rellena todos los campos del Paso 2 */
  async fillCredentials(data: CompanyCredentialsData): Promise<void> {
    await this.page.selectOption('[formcontrolname="intent"]', data.intent);
    await this.page.fill('[formcontrolname="email"]', data.email);
    await this.page.fill('[formcontrolname="password"]', data.password);
    await this.page.fill('[formcontrolname="confirmPassword"]', data.confirmPassword);
  }

  /** Envía el formulario del Paso 2 */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Flujo completo: goto → selectCompany → fillStep1 → goNext → fillStep2 → submit */
  async registerCompany(company: CompanyFormData, credentials: CompanyCredentialsData): Promise<void> {
    await this.goto();
    await this.selectCompany();
    await this.fillCompanyData(company);
    await this.goNext();
    await this.fillCredentials(credentials);
    await this.submit();
  }

  getFieldError(fieldName: string): Locator {
    return this.page.locator(`div:has([formcontrolname="${fieldName}"]) > p.text-rose-500`);
  }


  getPasswordMismatchError(): Locator {
    return this.page.locator('div:has([formcontrolname="confirmPassword"]) > p.text-rose-500');
  }

}
