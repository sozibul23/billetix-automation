import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CheckoutPage — POM for the flight checkout / passenger details page.
 *
 * UI confirmed from billetix.dz (2026-09-23):
 * - Title: button toggles (Mr / Mrs / Ms), NOT a <select>
 * - Name placeholders: JOHN / DOE (uppercase)
 * - Price summary sidebar visible on desktop, behind a toggle on mobile
 * - Coupon input: placeholder "Coupon"
 * - Session countdown timer visible near the top
 */
export class CheckoutPage extends BasePage {
  // ── Page heading ────────────────────────────────────────────────────────
  readonly pageHeading: Locator;

  // ── Title button toggles (actual buttons, NOT a <select>) ───────────────
  readonly titleMrButton: Locator;
  readonly titleMrsButton: Locator;
  readonly titleMsButton: Locator;

  // ── Name inputs — placeholders are uppercase: JOHN / DOE ────────────────
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;

  // ── Other passenger fields ──────────────────────────────────────────────
  readonly dobInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;

  // ── Pricing & coupon ────────────────────────────────────────────────────
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly priceSummaryCard: Locator;
  readonly baseFareRow: Locator;
  readonly taxesRow: Locator;
  readonly totalPriceDisplay: Locator;
  readonly couponDiscountRow: Locator;

  // ── Session countdown ───────────────────────────────────────────────────
  readonly sessionCountdownTimer: Locator;

  // ── CTAs ────────────────────────────────────────────────────────────────
  readonly continuePaymentButton: Locator;

  // ── Validation ──────────────────────────────────────────────────────────
  readonly couponErrorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page
      .locator('h1, h2, h3, h6')
      .filter({ hasText: /Passenger|Traveller|Booking|Checkout|Flight Details|Adult Traveler|Fare Summary/i })
      .first();

    // ── Title: button toggles ────────────────────────────────────────────
    this.titleMrButton  = page.locator('button').filter({ hasText: /^Mr$/ }).first();
    this.titleMrsButton = page.locator('button').filter({ hasText: /^Mrs$/ }).first();
    this.titleMsButton  = page.locator('button').filter({ hasText: /^Ms$/ }).first();

    // ── Name inputs ──────────────────────────────────────────────────────
    this.firstNameInput = page
      .locator('input[placeholder="John"], input[placeholder*="First" i], input[name*="firstName" i]')
      .first();

    this.lastNameInput = page
      .locator('input[placeholder="Doe"], input[placeholder*="Last" i], input[name*="lastName" i]')
      .first();

    this.dobInput = page
      .locator('input[placeholder="Select Date"], input[placeholder*="Date of Birth" i], input[type="date"]')
      .first();

    this.phoneInput = page
      .locator('input[placeholder="Mobile Number"], input[type="tel"]')
      .first();

    this.emailInput = page
      .locator('input[placeholder="example@mail.com"], input[type="email"]')
      .first();

    // ── Coupon ────────────────────────────────────────────────────────────
    this.couponInput = page.locator('input[placeholder="Coupon"], input[placeholder*="coupon" i]').first();
    this.applyCouponButton = page.locator('button').filter({ hasText: /^Apply$/i }).first();

    this.couponErrorMessage = page
      .locator('[class*="error" i], [class*="alert" i], [role="alert"], p, span')
      .filter({ hasText: /invalid.*coupon|coupon.*invalid|expired.*coupon|not.*valid|invalide/i })
      .first();

    // ── Price summary ─────────────────────────────────────────────────────
    this.priceSummaryCard = page
      .locator('div, aside, section')
      .filter({ has: page.locator('button:has-text("Base Fare"), button:has-text("Taxes")') })
      .first();

    this.baseFareRow = page
      .locator('button')
      .filter({ hasText: /Base Fare/i })
      .first();

    this.taxesRow = page
      .locator('button')
      .filter({ hasText: /Taxes/i })
      .first();

    this.totalPriceDisplay = page
      .locator('p, div, span')
      .filter({ hasText: /Total Payable/i })
      .first();

    this.couponDiscountRow = page
      .locator('tr, div, span, p')
      .filter({ hasText: /Discount|Coupon|Réduction/i })
      .first();

    // ── Session countdown ────────────────────────────────────────────────
    this.sessionCountdownTimer = page
      .locator('div, section')
      .filter({ hasText: /Session Timeout/i })
      .first();

    // ── CTA — live button is named "Next" ────────────────────────────────
    this.continuePaymentButton = page
      .locator('button')
      .filter({ hasText: /^Next$|Continue|Proceed|Pay Now|Book Now|Payment/i })
      .first();
  }

  /**
   * Navigates to the checkout page via a real flight search + Select click.
   * daysAhead: departure date offset from today.
   */
  async navigateToCheckout(daysAhead: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const dateStr = futureDate.toISOString().split('T')[0];

    await this.page.goto(
      `/flight/search?trips=ALG,ORN,${dateStr}&journey_type=OneWay&adults=1`,
      { waitUntil: 'domcontentloaded', timeout: 40000 }
    );

    // Allow React re-render hydration to settle
    const loader = this.page.locator('.animate-pulse, .skeleton, [aria-label*="loading"]').first();
    await loader.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

    const selectBtn = this.page
      .locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Réserver")')
      .first();
    await selectBtn.click({ timeout: 35000 });
    await this.page.waitForURL(/\/flight\/checkout/i, { timeout: 35000 });
    await this.pageHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  /**
   * Fills visible passenger detail fields.
   */
  async fillPassengerDetails(details: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    title?: 'Mr' | 'Mrs' | 'Ms';
    gender?: 'Male' | 'Female';
  }) {
    // Select Title (defaults to Mr)
    const titleToSelect = details.title || 'Mr';
    const titleBtn = this.page.locator('button, div, span, label').filter({ hasText: new RegExp(`^${titleToSelect}$`, 'i') }).first();
    if (await titleBtn.isVisible().catch(() => false)) {
      await titleBtn.click().catch(() => {});
    }

    // Select Gender (defaults to Male)
    const genderToSelect = details.gender || 'Male';
    const genderBtn = this.page.locator('button, div, span, label').filter({ hasText: new RegExp(`^${genderToSelect}$`, 'i') }).first();
    if (await genderBtn.isVisible().catch(() => false)) {
      await genderBtn.click().catch(() => {});
    }

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

  /**
   * Applies a coupon code.
   */
  async applyCoupon(couponCode: string) {
    if (await this.couponInput.isVisible()) {
      await this.couponInput.fill(couponCode);
      await this.applyCouponButton.click();
    }
  }

  /**
   * Extracts all visible price amounts from the summary card as integers.
   * Returns an array of DZD values found in the fare breakdown.
   */
  async extractPriceAmounts(): Promise<number[]> {
    const texts = await Promise.all([
      this.baseFareRow.innerText().catch(() => ''),
      this.taxesRow.innerText().catch(() => ''),
      this.totalPriceDisplay.innerText().catch(() => ''),
      this.priceSummaryCard.innerText().catch(() => ''),
    ]);
    const combined = texts.join(' ');
    // Matches numbers with currency prefix/suffix or standalone numeric amounts in price elements
    const matches = combined.match(/(?:دج|DZD|DA)[\s\u00A0]*(\d[\d\s,.]*)|(\d[\d\s,.]*)[\s\u00A0]*(?:دج|DZD|DA)|\b\d{3,6}(?:\.\d{2})?\b/g) ?? [];
    return matches
      .map(s => parseFloat(s.replace(/[^0-9.]/g, '')))
      .filter(n => !isNaN(n) && n > 0);
  }

  /**
   * Returns true if the checkout page was successfully reached.
   */
  async isCheckoutReachable(): Promise<boolean> {
    return this.page.url().includes('/flight/checkout');
  }
}
