import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly loginModalTrigger: Locator;
  readonly registerModalTrigger: Locator;
  readonly loginModal: Locator;
  readonly registerModal: Locator;

  // Login Form
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly forgotPasswordLink: Locator;

  // Register Form
  readonly registerNameInput: Locator;
  readonly registerEmailInput: Locator;
  readonly registerPasswordInput: Locator;
  readonly registerConfirmPasswordInput: Locator;
  readonly registerPhoneInput: Locator;
  readonly registerSubmitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginModalTrigger = page.locator('nav button:has-text("Login / Signup")').first();
    this.registerModalTrigger = page.locator('button:has-text("Register here")');
    this.loginModal = page.locator('dialog, div').filter({ has: page.locator('h2', { hasText: 'Log In' }) }).first();
    this.registerModal = page.locator('dialog, div').filter({ has: page.locator('h2', { hasText: 'Register' }) }).first();

    this.loginEmailInput = this.loginModal.locator('input[placeholder*="Email"], input[type="email"]').first();
    this.loginPasswordInput = this.loginModal.locator('input[placeholder*="Password"], input[type="password"]').first();
    this.loginSubmitButton = this.loginModal.locator('button:has-text("Log In")');
    this.forgotPasswordLink = page.locator('a[href*="forgot-password"]');

    this.registerNameInput = page.locator('input[placeholder*="Name"]').first();
    this.registerEmailInput = page.locator('div:has(h2:has-text("Register")) input[type="email"], div:has(h2:has-text("Register")) input[placeholder*="Email"]').first();
    this.registerPasswordInput = page.locator('div:has(h2:has-text("Register")) input[type="password"]').first();
    this.registerConfirmPasswordInput = page.locator('div:has(h2:has-text("Register")) input[type="password"]').nth(1);
    this.registerPhoneInput = page.locator('input[placeholder*="Phone"], input[type="number"], input[type="tel"]').first();
    this.registerSubmitButton = page.locator('button:has-text("Register")').last();
  }

  async openLoginModal() {
    await this.loginModalTrigger.click();
    const loginHeading = this.page.locator('h2:has-text("Log In")');
    await expect(loginHeading).toBeVisible({ timeout: 10000 });
  }

  async openRegisterModal() {
    await this.openLoginModal();
    const trigger = this.page.locator('button:has-text("Register here"), a:has-text("Register here")').first();
    await expect(trigger).toBeVisible({ timeout: 10000 });
    await trigger.click({ force: true });
    const regHeading = this.page.locator('h2:has-text("Register")');
    await expect(regHeading).toBeVisible({ timeout: 10000 });
  }

  async submitLogin(email: string, pass: string) {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(pass);
    await this.loginSubmitButton.click();
  }
}
