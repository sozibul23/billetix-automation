import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly pageHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly continuePaymentButton: Locator;
  readonly priceSummaryCard: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('h1, h2').filter({ hasText: /Passenger|Traveller|Booking|Checkout|Flight Details/i }).first();
    this.firstNameInput = page.locator('input[placeholder="John"], input[placeholder*="First Name" i]').first();
    this.lastNameInput = page.locator('input[placeholder="Doe"], input[placeholder*="Last Name" i]').first();
    this.dobInput = page.locator('input[placeholder="Select Date"], input[placeholder*="Date of Birth" i]').first();
    this.phoneInput = page.locator('input[placeholder="Mobile Number"], input[type="tel"]').first();
    this.emailInput = page.locator('input[placeholder="example@mail.com"], input[type="email"]').first();
    this.couponInput = page.locator('input[placeholder="Coupon"]');
    this.applyCouponButton = page.locator('button:has-text("Apply")');
    this.continuePaymentButton = page.locator('button').filter({ hasText: /Continue|Proceed|Book|Payment|Pay/i }).first();
    this.priceSummaryCard = page.locator('div').filter({ hasText: /Total|Price Summary|Base Fare/i }).last();
  }

  async navigateToCheckout(daysAhead: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const dateStr = futureDate.toISOString().split('T')[0];

    await this.page.goto(`/flight/search?trips=ALG,ORN,${dateStr}&journey_type=OneWay&adults=1`, {
      waitUntil: 'domcontentloaded',
    });

    // Allow React re-render hydration to settle
    const loader = this.page.locator('.animate-pulse, .skeleton, [aria-label*="loading"]').first();
    await loader.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

    const selectBtn = this.page.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Réserver")').first();
    await selectBtn.click({ timeout: 35000 });
    await this.page.waitForURL(/\/flight\/checkout/i, { timeout: 35000 });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  async fillPassengerDetails(details: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }) {
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(details.firstName);
    }
    if (await this.lastNameInput.isVisible()) {
      await this.lastNameInput.fill(details.lastName);
    }
    if (await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(details.phone);
    }
    if (await this.emailInput.isVisible()) {
      await this.emailInput.fill(details.email);
    }
  }

  async applyCoupon(couponCode: string) {
    if (await this.couponInput.isVisible()) {
      await this.couponInput.fill(couponCode);
      await this.applyCouponButton.click();
    }
  }
}
