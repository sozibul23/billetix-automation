import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Billetix - UI Components Baseline & Responsive Layout Suite', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('/');
  });

  test('TC-UI-01: Header component integrity (Logo, Currency, Language, Auth, B2B)', async ({ page, isMobile }) => {
    // 1. Logo Verification
    await homePage.verifyLogoVisible();
    const logoLink = page.locator('nav a[href="/"]').first();
    await expect(logoLink).toBeVisible();

    if (!isMobile) {
      // 2. Currency Selector on Desktop
      const currencyBtn = page.locator('button').filter({ hasText: /DZD|DA|EUR|USD/i }).first();
      await expect(currencyBtn).toBeVisible();

      // 3. Language Switcher
      const langBtn = page.locator('button').filter({ hasText: /English|Français|العربية|EN|FR|AR/i }).first();
      await expect(langBtn).toBeVisible();

      // 4. B2B Agent Portal Link
      const b2bLink = page.locator('header a[href*="agent.billetix.dz"], nav a[href*="agent.billetix.dz"]').first();
      await expect(b2bLink).toBeVisible();
      await expect(b2bLink).toHaveAttribute('href', 'https://agent.billetix.dz/login');

      // 5. Login/Signup CTA Button
      const loginBtn = page.locator('button').filter({ hasText: /Login|Signup|Connexion|تسجيل/i }).first();
      await expect(loginBtn).toBeVisible();
    } else {
      // On Mobile: Mobile menu toggle should be visible
      const mobileMenuBtn = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
      await expect(mobileMenuBtn).toBeVisible();
    }
  });

  test('TC-UI-02: Footer links, payment provider badges, and copyright statement', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    // 1. Payment Providers & PCI-DSS Cert badges
    const paymentSection = footer.locator('header.footer-title:has-text("Payment Accept"), img[alt*="Payment"], img[alt*="pci-dss" i]').first();
    await expect(paymentSection).toBeVisible();

    // 2. Official Contact Info (Phone & Email)
    const emailLink = footer.locator('a[href^="mailto:support@billetix.dz"]');
    const phoneLink = footer.locator('a[href^="tel:040529950"]');
    await expect(emailLink).toBeVisible();
    await expect(phoneLink).toBeVisible();

    // 3. Social Presence
    const fbLink = footer.locator('a[aria-label="Facebook"], a[href*="facebook.com"]').first();
    await expect(fbLink).toBeVisible();

    // 4. Copyright Notice
    const copyrightText = footer.locator('text=/Copyright.*BILLETIX|All rights reserved/i').first();
    await expect(copyrightText).toBeVisible();
  });

  test('TC-UI-03: Zero fatal console errors on initial landing', async ({ page }) => {
    const fatalErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Catch critical uncaught JS syntax or runtime crashes
        if (text.includes('Uncaught') || text.includes('SyntaxError') || text.includes('TypeError: Cannot read property')) {
          fatalErrors.push(text);
        }
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    expect(fatalErrors).toHaveLength(0);
  });

  test('TC-UI-04: Automated internal dead-links verification (No 404 or 500 status)', async ({ page, request }) => {
    // Collect internal links on the homepage
    const links = await page.locator('a[href^="/"]').evaluateAll((elements) =>
      elements
        .map((el) => el.getAttribute('href'))
        .filter((href): href is string => !!href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:'))
    );

    const uniqueLinks = Array.from(new Set(links)).slice(0, 8); // Verify top 8 unique internal links

    for (const link of uniqueLinks) {
      const targetUrl = `https://billetix.dz${link}`;
      const response = await request.get(targetUrl, { ignoreHTTPSErrors: true });
      expect(response.status(), `Checking URL: ${targetUrl}`).toBeLessThan(500);
      expect(response.status(), `Checking URL not broken: ${targetUrl}`).not.toBe(404);
    }
  });

  test('TC-UI-05: Responsive Viewport verification across Desktop and Mobile breakpoints', async ({ page }) => {
    const viewports = [
      { name: 'Desktop Full HD', width: 1920, height: 1080 },
      { name: 'Standard Laptop', width: 1366, height: 768 },
      { name: 'Small Laptop', width: 1024, height: 768 },
      { name: 'Mobile Landscape', width: 640, height: 480 },
      { name: 'Mobile Portrait', width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      // Verify hero title is rendered
      await expect(page.locator('h1').first()).toBeVisible();

      // Verify page body does not trigger unintended horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `Viewport ${vp.name} should not have horizontal overflow`).toBeLessThanOrEqual(clientWidth + 2);
    }
  });
});
