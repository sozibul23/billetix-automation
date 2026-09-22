import { test, expect } from '@playwright/test';
import { SupportPage } from '../pages/SupportPage';

test.describe('Billetix - Customer Support, FAQ & Legal Policies Suite', () => {
  let supportPage: SupportPage;

  test.beforeEach(async ({ page }) => {
    supportPage = new SupportPage(page);
  });

  test('TC-SUP-01: Verify Contact Us page elements and official contact channels', async ({ page }) => {
    await supportPage.navigate('/support/contact');

    await expect(page).toHaveTitle(/Contact|Billetix/i);
    await expect(supportPage.fullNameInput).toBeVisible({ timeout: 10000 });
    await expect(supportPage.emailInput).toBeVisible();
    await expect(supportPage.messageInput).toBeVisible();
    await expect(supportPage.sendMessageButton).toBeVisible();

    // Verify official phone and email
    await expect(supportPage.phoneLink).toBeVisible();
    await expect(supportPage.emailLink).toBeVisible();
  });

  test('TC-SUP-02: Verify Contact Us form invalid input validation', async ({ page }) => {
    await supportPage.navigate('/support/contact');

    // Fill form with invalid email and submit
    await supportPage.fillContactForm({
      fullName: 'QA Tester',
      email: 'invalid-email-format',
      phone: '040529950',
      message: 'This is an automated test inquiry from Playwright QA suite.',
    });

    await supportPage.submitContactForm();
    await page.waitForTimeout(1000);

    // Verify user stays on contact page and form is not submitted silently
    await expect(page).toHaveURL(/\/support\/contact/);
  });

  test('TC-SUP-03: Verify FAQ page accordion questions and answer expansion', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/FAQ/i);

    // Verify first FAQ details container
    const firstDetails = page.locator('details').first();
    await expect(firstDetails).toBeVisible({ timeout: 10000 });

    const summary = firstDetails.locator('summary');
    await expect(summary).toContainText(/How can I book a flight ticket/i);

    // Verify answer paragraph is visible (default open)
    const answer = firstDetails.locator('p');
    await expect(answer).toBeVisible();

    // Click summary to toggle and verify interactive accordion
    await summary.click();
    await page.waitForTimeout(400);
    await summary.click();
    await expect(answer).toBeVisible();
  });

  test('TC-SUP-04: Verify legal policy pages integrity (Terms, Privacy, Refund)', async ({ page }) => {
    const policyRoutes = [
      { path: '/terms-conditions', expectedTitle: /Terms/i },
      { path: '/privacy-policy', expectedTitle: /Privacy/i },
      { path: '/refund-policy', expectedTitle: /Refund/i },
    ];

    for (const route of policyRoutes) {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400); // 200 OK
      await expect(page).toHaveTitle(route.expectedTitle);

      // Verify legal entity name is present on the page
      const content = page.locator('main, body');
      await expect(content).toContainText(/BILLETIX/i);
    }
  });
});
