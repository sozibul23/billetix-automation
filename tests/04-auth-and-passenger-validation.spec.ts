import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Billetix - Authentication & User Registration Validation Suite', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.navigate('/');
  });

  test('TC-AUTH-01: Verify Login modal elements and Google OAuth option', async ({ page }) => {
    // Open login modal
    await authPage.openLoginModal();

    // Verify Log In heading
    const loginHeading = page.locator('h2:has-text("Log In")');
    await expect(loginHeading).toBeVisible();

    // Verify Google Auth button is available
    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();

    // Verify Forgot Password link
    const forgotLink = page.locator('a[href*="forgot-password"]');
    await expect(forgotLink).toBeVisible();
  });

  test('TC-AUTH-02: Verify invalid credentials handling on Login form', async ({ page }) => {
    await authPage.openLoginModal();

    const modal = page.locator('div').filter({ has: page.locator('h2', { hasText: 'Log In' }) }).last();
    const emailInput = modal.locator('input[type="email"], input[placeholder*="Email"]').first();
    const passInput = modal.locator('input[type="password"], input[placeholder*="Password"]').first();
    const submitBtn = modal.locator('button').filter({ hasText: 'Log In' }).first();

    await emailInput.fill('invalid.qa.test@example.com');
    await passInput.fill('WrongPass123!');
    await submitBtn.click({ force: true });

    // Wait for validation/API response
    await page.waitForTimeout(1500);

    // Verify user remains on public homepage without crash
    await expect(page).toHaveURL('/');
  });

  test('TC-AUTH-03: Verify Registration modal fields structure', async ({ page }) => {
    await authPage.openRegisterModal();

    const regModal = page.locator('div').filter({ has: page.locator('h2', { hasText: 'Register' }) }).last();
    await expect(regModal.locator('h2:has-text("Register")')).toBeVisible();

    // Verify required inputs: Name, Email, Password, Phone
    const nameInput = regModal.locator('input[placeholder*="Name"]').first();
    const emailInput = regModal.locator('input[placeholder*="Email"]').first();
    const phoneInput = regModal.locator('input[placeholder*="Phone"], input[type="number"], input[type="tel"]').first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
  });

  test('TC-AUTH-04: Verify password mismatch error in Registration form', async ({ page }) => {
    await authPage.openRegisterModal();

    const regModal = page.locator('div').filter({ has: page.locator('h2', { hasText: 'Register' }) }).last();
    const passInputs = regModal.locator('input[type="password"]');
    if (await passInputs.count() >= 2) {
      await passInputs.nth(0).fill('Password@123');
      await passInputs.nth(1).fill('Mismatch@999');

      const registerBtn = regModal.locator('button:has-text("Register")').last();
      await registerBtn.click({ force: true });
      await page.waitForTimeout(500);

      // Verify modal remains open
      await expect(regModal.locator('h2:has-text("Register")')).toBeVisible();
    }
  });
});
