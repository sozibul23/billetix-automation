import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle: Locator;
  readonly oneWayRadio: Locator;
  readonly roundTripRadio: Locator;
  readonly multiCityRadio: Locator;

  readonly fromContainer: Locator;
  readonly toContainer: Locator;
  readonly airportSearchInput: Locator;

  readonly departureDateContainer: Locator;
  readonly returnDateContainer: Locator;

  readonly travellersAndClassButton: Locator;
  readonly travellersApplyButton: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.locator('h1:has-text("Book domestic & international flights from Algeria")');
    this.oneWayRadio = page.locator('input[name="journey_type"][value="OneWay"]');
    this.roundTripRadio = page.locator('input[name="journey_type"][value="RoundTrip"]');
    this.multiCityRadio = page.locator('input[name="journey_type"][value="MultiCity"]');

    this.fromContainer = page.locator('.sb-input-container', { hasText: 'From' });
    this.toContainer = page.locator('.sb-input-container', { hasText: 'To' });
    this.airportSearchInput = page.locator('input[placeholder*="Airport code, city"]');

    this.departureDateContainer = page.locator('.sb-input-container', { hasText: 'Departure' });
    this.returnDateContainer = page.locator('.sb-input-container', { hasText: 'Return' });

    this.travellersAndClassButton = page.locator('button', { hasText: 'Travellers & Class' });
    this.travellersApplyButton = page.locator('button:has-text("Apply")');
    this.searchButton = page.locator('#flightSearchButton');
  }

  async selectJourneyType(type: 'OneWay' | 'RoundTrip' | 'MultiCity') {
    if (type === 'OneWay') {
      await this.oneWayRadio.check({ force: true });
    } else if (type === 'RoundTrip') {
      await this.roundTripRadio.check({ force: true });
    } else {
      await this.multiCityRadio.check({ force: true });
    }
  }

  async openTravellersModal() {
    await this.travellersAndClassButton.scrollIntoViewIfNeeded();
    await expect(this.travellersAndClassButton).toBeVisible();
    await this.travellersAndClassButton.click();

    // Check if travellers modal or bottom sheet is opened
    const applyBtn = this.page.locator('button:has-text("Apply"), button:has-text("Done")').first();
    try {
      await applyBtn.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Retry click in case of mobile layout animation or hydration lag
      await this.travellersAndClassButton.click({ force: true });
      await applyBtn.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async closeTravellersModal() {
    const closeBtn = this.page.locator('button:has-text("Apply"), button:has-text("Done")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.scrollIntoViewIfNeeded().catch(() => {});
      await closeBtn.click({ force: true });
    }
  }

  async selectAdultsCount(count: number) {
    const adultBtn = this.page.locator('button').filter({ hasText: new RegExp(`^${count}$`) }).first();
    await adultBtn.click({ force: true });
  }

  async isInfantOptionDisabled(count: number): Promise<boolean> {
    const infantBtn = this.page.locator('button').filter({ hasText: new RegExp(`^${count}$`) }).last();
    await infantBtn.waitFor({ state: 'attached', timeout: 5000 });
    return await infantBtn.isDisabled();
  }

  async clickSearch() {
    await this.searchButton.click();
  }
}
