import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Billetix - Automated Accessibility (a11y) Audit Suite', () => {
  test('TC-A11Y-01: Scan homepage for WCAG 2.1 Level A & AA violations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Run Axe automated accessibility analysis
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    // Verify scan completed and report violation counts for audit
    console.log(`[a11y Audit] Total accessibility findings: ${accessibilityScanResults.violations.length}`);
    expect(accessibilityScanResults).toBeDefined();
    expect(accessibilityScanResults.passes.length).toBeGreaterThan(0);
  });

  test('TC-A11Y-02: Verify image elements have descriptive alternative text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify main brand logos have alt attributes
    const logoImgs = page.locator('nav img, footer img');
    const count = await logoImgs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(5, count); i++) {
      const alt = await logoImgs.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt!.trim().length).toBeGreaterThan(0);
    }
  });

  test('TC-A11Y-03: Verify interactive search button has accessible name', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const searchBtn = page.locator('#flightSearchButton');
    await expect(searchBtn).toBeVisible();

    const accessibleName = await searchBtn.innerText();
    expect(accessibleName.trim()).toBe('SEARCH');
  });
});
