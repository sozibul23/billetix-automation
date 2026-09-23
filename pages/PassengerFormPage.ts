import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * PassengerFormPage - Page Object Model for the passenger information form
 * on the flight checkout/booking page.
 *
 * UI observed from billetix.dz (2026-09-23):
 * - Title: 3 button toggles (Mr, Mrs, Ms) — NOT a <select>
 * - Gender: 2 button toggles (Male, Female) — NOT radio inputs
 * - First Name placeholder: "JOHN" (all caps)
 * - Last Name placeholder: "DOE" (all caps)
 * - DOB: date picker (formatted display, e.g. "September 23, 1996")
 *
 * Known Bug (QA-FINDING-03):
 *   Selecting "Mr" does NOT auto-sync Gender to "Male".
 *   The "Female" button remains highlighted after selecting "Mr".
 */
export class PassengerFormPage extends BasePage {
  // Form heading — "Adult Traveler 1" visible in the screenshot
  readonly formHeading: Locator;

  // Title button group — actual buttons, not a select
  readonly titleMrButton: Locator;
  readonly titleMrsButton: Locator;
  readonly titleMsButton: Locator;

  // Gender button group — actual buttons, not radio inputs
  readonly genderMaleButton: Locator;
  readonly genderFemaleButton: Locator;

  // Name inputs (placeholders are uppercase: JOHN, DOE)
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;

  // Date of birth — date picker element
  readonly dobInput: Locator;

  // Nationality dropdown/select
  readonly nationalitySelect: Locator;

  // Passport fields
  readonly passportNumberInput: Locator;
  readonly passportExpiryInput: Locator;

  // Contact details
  readonly emailInput: Locator;
  readonly phoneInput: Locator;

  // Form submit/continue button
  readonly continueButton: Locator;

  // Validation error container
  readonly validationError: Locator;

  constructor(page: Page) {
    super(page);

    // Heading seen in screenshot: "Adult Traveler 1"
    this.formHeading = page
      .locator('h1, h2, h3')
      .filter({ hasText: /Adult Traveler|Child Traveler|Infant|Passenger|Booking|Checkout/i })
      .first();

    // ── Title: button toggles (Mr / Mrs / Ms) ──────────────────────────────
    this.titleMrButton  = page.locator('button').filter({ hasText: /^Mr$/ }).first();
    this.titleMrsButton = page.locator('button').filter({ hasText: /^Mrs$/ }).first();
    this.titleMsButton  = page.locator('button').filter({ hasText: /^Ms$/ }).first();

    // ── Gender: button toggles (Male / Female) ─────────────────────────────
    this.genderMaleButton   = page.locator('button').filter({ hasText: /^Male$/ }).first();
    this.genderFemaleButton = page.locator('button').filter({ hasText: /^Female$/ }).first();

    // ── Name inputs — placeholder is uppercase JOHN / DOE ──────────────────
    this.firstNameInput = page
      .locator('input[placeholder="JOHN"], input[placeholder*="First" i], input[name*="firstName" i]')
      .first();

    this.lastNameInput = page
      .locator('input[placeholder="DOE"], input[placeholder*="Last" i], input[name*="lastName" i]')
      .first();

    // ── DOB — date picker (text or date input) ─────────────────────────────
    this.dobInput = page
      .locator('input[placeholder*="Date of Birth" i], input[placeholder="Select Date"], input[type="date"], input[name*="dob" i]')
      .first();

    // ── Nationality ────────────────────────────────────────────────────────
    this.nationalitySelect = page
      .locator('select[name*="nationality" i], input[placeholder*="Nationality" i], [placeholder*="nationality" i]')
      .first();

    // ── Passport ───────────────────────────────────────────────────────────
    this.passportNumberInput = page
      .locator('input[placeholder*="Passport" i], input[name*="passport" i]')
      .first();

    this.passportExpiryInput = page
      .locator('input[placeholder*="Expir" i], input[name*="expiry" i], input[name*="passportExpiry" i]')
      .first();

    // ── Contact ────────────────────────────────────────────────────────────
    this.emailInput = page
      .locator('input[type="email"], input[placeholder="example@mail.com"], input[placeholder*="email" i]')
      .first();

    this.phoneInput = page
      .locator('input[type="tel"], input[placeholder="Mobile Number"], input[placeholder*="phone" i]')
      .first();

    // ── Submit ─────────────────────────────────────────────────────────────
    // Exclude Title/Gender buttons from matching by using a longer hasText regex
    this.continueButton = page
      .locator('button')
      .filter({ hasText: /Continue|Proceed|Confirm Booking|Pay Now|Submit/i })
      .first();

    // ── Validation error ───────────────────────────────────────────────────
    this.validationError = page
      .locator('[class*="error" i], [class*="invalid" i], [role="alert"], p.text-red-500, span.text-red-500')
      .first();
  }

  /**
   * Clicks a title button by name (Mr, Mrs, Ms).
   */
  async selectTitle(title: 'Mr' | 'Mrs' | 'Ms') {
    const btnMap = {
      Mr: this.titleMrButton,
      Mrs: this.titleMrsButton,
      Ms: this.titleMsButton,
    };
    const btn = btnMap[title];
    if (await btn.isVisible()) {
      await btn.click();
    }
  }

  /**
   * Clicks a gender button by name (Male, Female).
   */
  async selectGender(gender: 'Male' | 'Female') {
    const btn = gender === 'Male' ? this.genderMaleButton : this.genderFemaleButton;
    if (await btn.isVisible()) {
      await btn.click();
    }
  }

  /**
   * Returns true if the given title button appears visually active/selected.
   * The app uses an orange background (Tailwind: bg-amber, bg-yellow, bg-orange)
   * or a border class to indicate selection.
   */
  async isTitleSelected(title: 'Mr' | 'Mrs' | 'Ms'): Promise<boolean> {
    const btnMap = {
      Mr: this.titleMrButton,
      Mrs: this.titleMrsButton,
      Ms: this.titleMsButton,
    };
    const btn = btnMap[title];
    return await btn.evaluate(el => {
      const cls = el.className;
      // Active state uses orange/amber background based on Billetix design system
      return cls.includes('bg-') && (
        cls.includes('amber') || cls.includes('orange') || cls.includes('yellow') ||
        cls.includes('primary') || cls.includes('selected') || cls.includes('active')
      );
    }).catch(() => false);
  }

  /**
   * Returns true if the given gender button appears visually active/selected.
   */
  async isGenderSelected(gender: 'Male' | 'Female'): Promise<boolean> {
    const btn = gender === 'Male' ? this.genderMaleButton : this.genderFemaleButton;
    return await btn.evaluate(el => {
      const cls = el.className;
      return cls.includes('bg-') && (
        cls.includes('amber') || cls.includes('orange') || cls.includes('yellow') ||
        cls.includes('primary') || cls.includes('selected') || cls.includes('active')
      );
    }).catch(() => false);
  }

  /**
   * Fills all passenger detail fields.
   * Skips fields that are not visible (optional or dynamically shown).
   */
  async fillPassengerDetails(details: {
    title?: 'Mr' | 'Mrs' | 'Ms';
    gender?: 'Male' | 'Female';
    firstName: string;
    lastName: string;
    dob?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
    email?: string;
    phone?: string;
  }) {
    if (details.title) {
      await this.selectTitle(details.title);
    }

    if (details.gender) {
      await this.selectGender(details.gender);
    }

    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(details.firstName);
    }

    if (await this.lastNameInput.isVisible()) {
      await this.lastNameInput.fill(details.lastName);
    }

    if (details.dob && (await this.dobInput.isVisible())) {
      await this.dobInput.fill(details.dob);
    }

    if (details.nationality && (await this.nationalitySelect.isVisible())) {
      const tagName = await this.nationalitySelect.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await this.nationalitySelect.selectOption({ label: details.nationality });
      } else {
        await this.nationalitySelect.fill(details.nationality);
      }
    }

    if (details.passportNumber && (await this.passportNumberInput.isVisible())) {
      await this.passportNumberInput.fill(details.passportNumber);
    }

    if (details.passportExpiry && (await this.passportExpiryInput.isVisible())) {
      await this.passportExpiryInput.fill(details.passportExpiry);
    }

    if (details.email && (await this.emailInput.isVisible())) {
      await this.emailInput.fill(details.email);
    }

    if (details.phone && (await this.phoneInput.isVisible())) {
      await this.phoneInput.fill(details.phone);
    }
  }

  /**
   * Submits the passenger form safely.
   * Uses isVisible() check instead of scrollIntoViewIfNeeded() to avoid timeout.
   */
  async submitForm() {
    const isVisible = await this.continueButton.isVisible();
    if (isVisible) {
      await this.continueButton.click({ force: true });
    }
  }

  /**
   * Asserts that a visible validation error exists on the page.
   */
  async verifyValidationError(errorTextPattern?: string | RegExp) {
    if (errorTextPattern) {
      const errLocator = this.page
        .locator('[class*="error" i], [class*="invalid" i], [role="alert"], p, span')
        .filter({ hasText: errorTextPattern })
        .first();
      await expect(errLocator).toBeVisible({ timeout: 8000 });
    } else {
      await expect(this.validationError).toBeVisible({ timeout: 8000 });
    }
  }

  /**
   * Navigates to the checkout passenger form by performing a one-way search.
   * daysAhead: number of days from today for the departure date.
   */
  async navigateToPassengerForm(daysAhead: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const dateStr = futureDate.toISOString().split('T')[0];

    await this.page.goto(
      `/flight/search?trips=ALG,ORN,${dateStr}&journey_type=OneWay&adults=1`,
      { waitUntil: 'domcontentloaded', timeout: 40000 }
    );

    // Wait for skeleton loaders to disappear
    const loader = this.page
      .locator('.animate-pulse, .skeleton, [aria-label*="loading"]')
      .first();
    await loader.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

    // Click first available Book/Select button
    const selectBtn = this.page
      .locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Réserver")')
      .first();
    await selectBtn.click({ timeout: 35000 });

    // Wait for checkout/passenger URL
    await this.page.waitForURL(/\/(flight\/checkout|passenger|booking)/i, { timeout: 35000 });

    // Wait for the "Adult Traveler 1" heading
    await this.formHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }
}
