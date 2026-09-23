import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlightSearchResultsPage extends BasePage {
  readonly searchSummaryHeader: Locator;
  readonly flightCards: Locator;
  readonly cheapestSortButton: Locator;
  readonly fastestSortButton: Locator;
  readonly nonStopCheckbox: Locator;
  readonly airlinesFilterContainer: Locator;
  readonly priceFilterSlider: Locator;
  readonly noFlightsBanner: Locator;
  readonly modifySearchButton: Locator;
  readonly flightDetailsButtons: Locator;
  // Mobile: button that opens the filter/sort drawer
  readonly mobileFilterButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchSummaryHeader = page.locator('header, .search-summary, h1').first();
    this.flightCards = page.locator('.flight-card, [data-testid="flight-card"], div.rounded-xl.shadow-md, div.rounded-2xl.shadow-lg').filter({ hasText: /DZD|DA/ });
    this.cheapestSortButton = page.locator('button, [role="tab"]').filter({ hasText: /Cheapest|Moins cher|الأرخص/i }).first();
    this.fastestSortButton = page.locator('button, [role="tab"]').filter({ hasText: /Fastest|Plus rapide|الأسرع/i }).first();
    this.nonStopCheckbox = page.locator('label, div').filter({ hasText: /Direct|Non-stop|Sans escale/i }).locator('input[type="checkbox"]').first();
    this.airlinesFilterContainer = page.locator('.airlines-filter, aside').filter({ hasText: /Airlines|Compagnies|شركات/i });
    this.priceFilterSlider = page.locator('input[type="range"]').first();
    this.noFlightsBanner = page.locator('text=/No flights found|Aucun vol trouvé|لا توجد رحلات/i');
    this.modifySearchButton = page.locator('button:has-text("Modify"), a:has-text("Modify")');
    this.flightDetailsButtons = page.locator('button:has-text("Details"), button:has-text("Détails")');
    // Mobile filter drawer trigger button
    this.mobileFilterButton = page
      .locator('button')
      .filter({ hasText: /Filter|Filtrer|Sort|Trier/i })
      .first();
  }

  async waitForSearchResultsLoaded() {
    // Wait for URL to include flight/search
    await expect(this.page).toHaveURL(/flight\/search/, { timeout: 25000 });
    // Wait for at least one card or empty banner
    await Promise.race([
      this.flightCards.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {}),
      this.noFlightsBanner.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
    ]);
  }

  async getFlightCardsCount(): Promise<number> {
    return await this.flightCards.count();
  }

  async sortByCheapest() {
    if (await this.cheapestSortButton.isVisible()) {
      await this.cheapestSortButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * On mobile, the filter sidebar is rendered inline (not a hidden drawer).
   * The checkbox may be scrolled off-screen — scroll it into view via JS first.
   */
  async filterByNonStop() {
    const isVisible = await this.nonStopCheckbox.isVisible();
    if (!isVisible) return;

    // Use JavaScript scrollIntoView + click to bypass both:
    // 1. "outside of viewport" — element exists but is scrolled off-screen
    // 2. "intercepts pointer events" — overlapping filter panel div
    await this.nonStopCheckbox.evaluate((el: HTMLInputElement) => {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      el.click();
    });
    await this.page.waitForTimeout(1000);
  }

  async selectAirline(airlineName: string) {
    const airlineCheckbox = this.page.locator(`label:has-text("${airlineName}") input[type="checkbox"]`).first();
    if (await airlineCheckbox.isVisible()) {
      await airlineCheckbox.check({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  async getFirstFlightPrice(): Promise<string> {
    const firstCard = this.flightCards.first();
    const priceText = await firstCard.locator('text=/\\d+([\\s,]\\d+)*\\s*(DZD|DA)/').first().innerText();
    return priceText.trim();
  }

  async selectFirstFlight() {
    const bookBtn = this.flightCards.first().locator('button:has-text("Book"), button:has-text("Select"), button:has-text("Réserver")').first();
    await bookBtn.click();
  }
}
