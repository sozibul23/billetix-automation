import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SupportPage extends BasePage {
  readonly pageHeading: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly messageInput: Locator;
  readonly sendMessageButton: Locator;

  // Contact info
  readonly addressText: Locator;
  readonly phoneLink: Locator;
  readonly emailLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1, h2').filter({ hasText: /Contact|Support|Get in touch/i }).first();
    this.fullNameInput = page.locator('input[name="fullname"], input[placeholder*="Full Name" i]').first();
    this.emailInput = page.locator('input[name="email"], input[placeholder*="Email" i]').first();
    this.phoneInput = page.locator('input[type="tel"], input[placeholder*="1 (702)"]').first();
    this.messageInput = page.locator('textarea[name="message"], textarea[placeholder*="Message" i]').first();
    this.sendMessageButton = page.locator('button:has-text("Send Message")');

    this.addressText = page.locator('footer, main').filter({ hasText: /Bir El Djir|Oran|Algerie/i }).first();
    this.phoneLink = page.locator('a[href*="040529950"]').first();
    this.emailLink = page.locator('a[href="mailto:support@billetix.dz"]').first();
  }

  async fillContactForm(data: { fullName: string; email: string; phone: string; message: string }) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    if (await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(data.phone);
    }
    await this.messageInput.fill(data.message);
  }

  async submitContactForm() {
    await this.sendMessageButton.click();
  }
}
