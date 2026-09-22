import { test, expect } from '@playwright/test';
import { FlightSearchResultsPage } from '../pages/FlightSearchResultsPage';

test.describe('Billetix - Flight Search Results & Filtering Suite', () => {
  let resultsPage: FlightSearchResultsPage;

  test.beforeEach(async ({ page }) => {
    resultsPage = new FlightSearchResultsPage(page);
  });

  test('TC-RSLT-01: Verify search results page structure and navigation for domestic route', async ({ page }) => {
    // Navigate to domestic route search results (Algiers to Oran)
    await resultsPage.navigate('/flight/search?trips=ALG,ORN');

    // Verify URL contains flight/search
    await expect(page).toHaveURL(/flight\/search/);

    // Verify page title or header indicates flight search
    await expect(page).toHaveTitle(/Billetix/i);

    // Verify header navigation elements remain accessible
    await resultsPage.verifyLogoVisible();
  });

  test('TC-RSLT-02: Verify currency consistency on search results page (DZD)', async ({ page }) => {
    await resultsPage.navigate('/flight/search?trips=ALG,ORN');

    // Verify default currency display in header remains DZD
    const currency = await resultsPage.getCurrencyText();
    expect(currency).toContain('DZD');
  });

  test('TC-RSLT-03: Verify zero results state or flight listing rendering without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate with valid trips query
    await resultsPage.navigate('/flight/search?trips=ALG,ORN');
    await page.waitForTimeout(2000);

    // Assert page has rendered meaningful structure (main content container is visible)
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Verify no critical unhandled exception crashed the React tree
    expect(consoleErrors.filter(e => e.includes('Uncaught Error') || e.includes('Minified React error'))).toHaveLength(0);
  });

  test('TC-RSLT-04: Verify mobile responsiveness on search results route', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await resultsPage.navigate('/flight/search?trips=ALG,ORN');
    
    // On mobile, verify navigation drawer button is functional
    await expect(resultsPage.mobileMenuButton).toBeVisible();
    await resultsPage.mobileMenuButton.click();

    // Verify slide-in drawer
    const drawer = page.locator('aside[role="dialog"]');
    await expect(drawer).toBeVisible();
  });
});
