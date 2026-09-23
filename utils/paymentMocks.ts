import { Page } from '@playwright/test';

/**
 * paymentMocks.ts — Playwright route intercept helpers for Billetix payment gateway simulation.
 *
 * Strategy: Billetix uses SATIM/CIB payment gateway which redirects to an external domain.
 * Real payment cannot be automated. These helpers use page.route() to intercept outgoing
 * requests and return mocked responses, allowing us to test the app's UI behaviour for
 * each payment outcome without real credentials.
 *
 * Usage:
 *   await mockPaymentApproved(page);
 *   // ... trigger checkout submit
 *   await expect(page).toHaveURL(/booking\/confirmation/i);
 */

// URL patterns that Billetix uses for payment gateway communication
const GATEWAY_PATTERNS = [
  '**/payment/**',
  '**/satim/**',
  '**/cib/**',
  '**/edahabia/**',
  '**/checkout/confirm**',
  '**/booking/process**',
  '**/api/payment**',
  '**/api/booking/confirm**',
];

/**
 * Intercepts the payment gateway callback and returns a successful payment response.
 * The app should redirect to /booking/confirmation with a PNR.
 */
export async function mockPaymentApproved(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.route(pattern, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'approved',
          transaction_id: 'TXN-MOCK-001',
          pnr: 'ABC123',
          message: 'Payment successful',
        }),
      });
    });
  }
}

/**
 * Intercepts the payment gateway callback and returns a declined payment response.
 * The app should stay on checkout and show an error message.
 */
export async function mockPaymentDeclined(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.route(pattern, async route => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'declined',
          error_code: 'INSUFFICIENT_FUNDS',
          message: 'Payment declined. Insufficient funds.',
        }),
      });
    });
  }
}

/**
 * Intercepts the payment gateway callback and returns a user-cancellation response.
 * The app should return safely to checkout without double-charging.
 */
export async function mockPaymentCancelled(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.route(pattern, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'cancelled',
          error_code: 'USER_CANCELLED',
          message: 'Payment was cancelled by the user.',
        }),
      });
    });
  }
}

/**
 * Intercepts the payment gateway and simulates a network timeout.
 * The app should show a graceful error / retry prompt.
 */
export async function mockPaymentTimeout(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.route(pattern, async route => {
      // Abort the request to simulate network failure
      await route.abort('timedout');
    });
  }
}

/**
 * Intercepts the payment gateway and returns an invalid 3DS OTP response.
 * The app should show a specific OTP rejection error.
 */
export async function mockPaymentInvalidOTP(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.route(pattern, async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'failed',
          error_code: 'INVALID_OTP',
          message: 'Invalid or expired OTP. Please try again.',
        }),
      });
    });
  }
}

/**
 * Removes all active payment route mocks from the page.
 * Call this in afterEach to prevent mock bleed between tests.
 */
export async function clearPaymentMocks(page: Page): Promise<void> {
  for (const pattern of GATEWAY_PATTERNS) {
    await page.unroute(pattern).catch(() => {});
  }
}
