import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Billetix - Passenger Details & Flight Checkout Flow Suite', () => {
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
  });

  test('TC-CHK-01: Navigate from search results to checkout page via Select flight button', async ({ page }) => {
    await checkoutPage.navigateToCheckout();
    await expect(page).toHaveURL(/\/flight\/checkout\?tracking_id=/i);
  });

  test('TC-CHK-02: Verify passenger form input fields structure', async () => {
    await checkoutPage.navigateToCheckout();

    // Verify Passenger name inputs
    await expect(checkoutPage.firstNameInput).toBeVisible({ timeout: 10000 });
    await expect(checkoutPage.lastNameInput).toBeVisible();

    // Verify Contact phone and email
    await expect(checkoutPage.phoneInput).toBeVisible();
    await expect(checkoutPage.emailInput).toBeVisible();
  });

  test('TC-CHK-03: Fill passenger form with valid test data and verify state', async () => {
    await checkoutPage.navigateToCheckout();

    // Fill valid passenger details
    await checkoutPage.fillPassengerDetails({
      firstName: 'Amine',
      lastName: 'Benali',
      phone: '0555123456',
      email: 'amine.benali.test@example.com',
    });

    await expect(checkoutPage.firstNameInput).toHaveValue('Amine');
    await expect(checkoutPage.lastNameInput).toHaveValue('Benali');
    await expect(checkoutPage.emailInput).toHaveValue('amine.benali.test@example.com');
  });

  test('TC-CHK-04: Verify coupon input and fare pricing summary visibility', async ({ isMobile, page }) => {
    await checkoutPage.navigateToCheckout();

    if (isMobile) {
      const breakdownBtn = page.locator('button').filter({ hasText: /Total Payable|View breakdown/i }).first();
      await expect(breakdownBtn).toBeVisible({ timeout: 10000 });
      await expect(breakdownBtn).toContainText(/دج|DZD/i);
      await breakdownBtn.click();
      await expect(checkoutPage.couponInput).toBeVisible({ timeout: 10000 });
    } else {
      // Coupon input should exist in desktop sidebar
      await expect(checkoutPage.couponInput).toBeVisible({ timeout: 10000 });

      // Price summary card should display DZD
      await expect(checkoutPage.priceSummaryCard).toBeVisible();
      await expect(checkoutPage.priceSummaryCard).toContainText(/DZD|دج/i);
    }
  });
});
