import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly currencyButton: Locator;
  readonly b2bLoginButton: Locator;
  readonly loginSignupButton: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('nav a[href="/"] img[alt="Billetix"]').first();
    this.currencyButton = page.locator('button[aria-label*="Change currency"]').first();
    this.b2bLoginButton = page.locator('a[href*="agent.billetix.dz"]').first();
    this.loginSignupButton = page.locator('nav button:has-text("Login / Signup")');
    this.mobileMenuButton = page.locator('button[aria-label="Open menu"]');
  }

  async navigate(path: string = '/') {
    try {
      await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 35000 });
    } catch (err) {
      // Graceful retry once on cold-start TLS or network lag
      await this.page.waitForTimeout(1000);
      await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 35000 });
    }
  }

  async verifyLogoVisible() {
    await expect(this.logo).toBeVisible({ timeout: 15000 });
  }

  async getCurrencyText(): Promise<string> {
    const text = await this.currencyButton.textContent();
    return text ? text.trim() : '';
  }

  async openB2BPortal(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.b2bLoginButton.click(),
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }
}
