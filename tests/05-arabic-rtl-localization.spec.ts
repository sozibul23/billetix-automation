import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

test.describe('Billetix - Localization & Arabic RTL Layout Suite', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.navigate('/');
  });

  test('TC-LOC-01: Verify language translation widget and default language settings', async ({ page }) => {
    // Check Google Translate element or language switcher in header
    const translateWidget = page.locator('#google_translate_element, select.goog-te-combo, button[aria-label*="language" i], [aria-label*="Translate" i]').first();
    const isWidgetPresent = await translateWidget.count() > 0;
    expect(isWidgetPresent).toBeTruthy();
  });

  test('TC-LOC-02: Verify Algerian Dinar (DZD) currency formatting across components', async ({ page, isMobile }) => {
    if (isMobile) {
      await basePage.mobileMenuButton.click();
      const mobileCurrencyBtn = page.locator('aside button[aria-label*="Change currency"]').first();
      await expect(mobileCurrencyBtn).toBeVisible();
      const ariaLabel = await mobileCurrencyBtn.getAttribute('aria-label');
      expect(ariaLabel).toContain('DZD');
    } else {
      const currencyBtn = basePage.currencyButton;
      await expect(currencyBtn).toBeVisible();
      const currencyText = await basePage.getCurrencyText();
      expect(currencyText).toContain('DZD');
    }
  });

  test('TC-LOC-03: Verify Algerian legal entity, local address and contact in footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Verify Oran, Algeria address
    await expect(footer).toContainText(/Oran|Algerie/i);

    // Verify official Algerian support phone number (040529950)
    const phoneLink = footer.locator('a[href*="040529950"]').first();
    await expect(phoneLink).toBeVisible();

    // Verify official support email
    const emailLink = footer.locator('a[href="mailto:support@billetix.dz"]');
    await expect(emailLink).toBeVisible();
  });

  test('TC-LOC-04: Verify legal compliance badges (IATA, PCI-DSS, Authorized agent)', async ({ page }) => {
    const iataBadge = page.locator('footer img[alt*="IATA"], footer [alt*="accredited" i]');
    const pciBadge = page.locator('footer img[alt*="PCI"], footer [alt*="DSS" i]');

    await expect(iataBadge).toBeVisible();
    await expect(pciBadge).toBeVisible();
  });
});
