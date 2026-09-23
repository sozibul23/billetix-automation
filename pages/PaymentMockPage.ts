import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * PaymentMockPage — POM for the post-booking confirmation and payment result pages.
 *
 * Covers:
 * - Booking confirmation page with PNR code
 * - E-ticket details (passenger name, flight number, cabin class, baggage)
 * - PDF download trigger
 * - Payment error/declined display
 * - Session expiry / countdown timer
 */
export class PaymentMockPage extends BasePage {
  // ── Booking Confirmation ────────────────────────────────────────────────
  readonly confirmationHeading: Locator;
  readonly pnrCode: Locator;
  readonly eticketSection: Locator;
  readonly passengerNameOnTicket: Locator;
  readonly flightNumberOnTicket: Locator;
  readonly cabinClassOnTicket: Locator;
  readonly baggageAllowanceOnTicket: Locator;

  // ── PDF / Email ─────────────────────────────────────────────────────────
  readonly downloadPdfButton: Locator;
  readonly sendEmailButton: Locator;

  // ── Payment Error States ────────────────────────────────────────────────
  readonly paymentErrorMessage: Locator;
  readonly retryPaymentButton: Locator;

  // ── Session / Countdown ─────────────────────────────────────────────────
  readonly sessionCountdownTimer: Locator;
  readonly sessionExpiredModal: Locator;

  // ── Price breakdown ─────────────────────────────────────────────────────
  readonly baseFareRow: Locator;
  readonly taxesRow: Locator;
  readonly totalPriceDisplay: Locator;

  constructor(page: Page) {
    super(page);

    // Confirmation heading — "Booking Confirmed", "Your PNR", "Réservation confirmée"
    this.confirmationHeading = page
      .locator('h1, h2, h3')
      .filter({ hasText: /Booking Confirmed|Your PNR|Confirmation|Réservation confirmée/i })
      .first();

    // PNR: 6 uppercase alphanumeric characters — could be in a badge, span, or heading
    this.pnrCode = page
      .locator('[class*="pnr" i], [class*="booking-ref" i], [data-testid*="pnr"], span, p, h2, h3')
      .filter({ hasText: /^[A-Z0-9]{6}$/ })
      .first();

    // E-ticket section container
    this.eticketSection = page
      .locator('[class*="ticket" i], [class*="eticket" i], [class*="itinerary" i], section')
      .filter({ hasText: /Flight|Passenger|Cabin/i })
      .first();

    this.passengerNameOnTicket = page
      .locator('[class*="passenger" i], [class*="traveler" i], td, span')
      .filter({ hasText: /[A-Z]{2,}\s+[A-Z]{2,}/i })
      .first();

    this.flightNumberOnTicket = page
      .locator('span, td, p')
      .filter({ hasText: /^(AH|QS|TK|6E|AI)\s*\d{3,4}$/i })
      .first();

    this.cabinClassOnTicket = page
      .locator('span, td, p, [class*="cabin"]')
      .filter({ hasText: /Economy|Business|First|Économique/i })
      .first();

    this.baggageAllowanceOnTicket = page
      .locator('span, td, p, [class*="baggage"]')
      .filter({ hasText: /\d+\s*(kg|Kg|KG)|No baggage/i })
      .first();

    // PDF download button
    this.downloadPdfButton = page
      .locator('a, button')
      .filter({ hasText: /Download|PDF|E-ticket|Télécharger/i })
      .first();

    // Send email button
    this.sendEmailButton = page
      .locator('button')
      .filter({ hasText: /Send Email|Email ticket|Envoyer/i })
      .first();

    // Payment error message
    this.paymentErrorMessage = page
      .locator('[class*="error" i], [class*="alert" i], [role="alert"], p, div')
      .filter({ hasText: /declined|failed|insufficient|cancelled|Invalid|OTP|retry/i })
      .first();

    // Retry payment button
    this.retryPaymentButton = page
      .locator('button')
      .filter({ hasText: /Retry|Try Again|Réessayer/i })
      .first();

    // Session countdown timer — "14:32 remaining", "Session expires in"
    this.sessionCountdownTimer = page
      .locator('[class*="timer" i], [class*="countdown" i], [class*="session" i], span, div')
      .filter({ hasText: /\d{1,2}:\d{2}|remaining|expires|expire/i })
      .first();

    // Session expired modal/dialog
    this.sessionExpiredModal = page
      .locator('[role="dialog"], [class*="modal" i], [class*="alert" i]')
      .filter({ hasText: /expired|Session|time.*out|Votre session/i })
      .first();

    // Fare breakdown rows
    this.baseFareRow = page
      .locator('tr, div, span')
      .filter({ hasText: /Base Fare|Fare|Tarif de base/i })
      .first();

    this.taxesRow = page
      .locator('tr, div, span')
      .filter({ hasText: /Tax|Surcharge|Taxe|Frais/i })
      .first();

    this.totalPriceDisplay = page
      .locator('[class*="total" i], [class*="grand" i], strong, b, h3')
      .filter({ hasText: /Total|Grand Total|DZD|دج/i })
      .last();
  }

  /**
   * Waits for the booking confirmation page to load.
   * Returns true if PNR code is visible, false otherwise.
   */
  async waitForConfirmation(timeout = 20000): Promise<boolean> {
    try {
      await this.confirmationHeading.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extracts the PNR code text from the confirmation page.
   * Returns null if PNR is not found.
   */
  async getPnrCode(): Promise<string | null> {
    try {
      // Try finding 6-char alphanumeric string in the page content
      const allText = await this.page.locator('body').innerText();
      const pnrMatch = allText.match(/\b[A-Z0-9]{6}\b/);
      return pnrMatch ? pnrMatch[0] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validates the PNR format: exactly 6 uppercase alphanumeric characters.
   */
  isPnrFormatValid(pnr: string): boolean {
    return /^[A-Z0-9]{6}$/.test(pnr);
  }

  /**
   * Triggers PDF download and returns the download object.
   * Uses Playwright's download event listener.
   */
  async triggerPdfDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 15000 }),
      this.downloadPdfButton.click({ timeout: 10000 }),
    ]);
    return download;
  }
}
