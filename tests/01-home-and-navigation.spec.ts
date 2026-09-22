import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Billetix - Home & Navigation Suite', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('/');
  });

  test('TC-NAV-01: Verify homepage title and hero banner elements', async ({ page }) => {
    // Assert title contains Billetix and Flights
    await expect(page).toHaveTitle(/Billetix/i);

    // Verify hero text
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroTitle).toContainText('Book domestic & international flights from Algeria');
  });

  test('TC-NAV-02: Verify brand logo and default currency display', async () => {
    // Verify logo is visible
    await homePage.verifyLogoVisible();

    // Verify default currency shows DZD
    const currency = await homePage.getCurrencyText();
    expect(currency).toContain('DZD');
  });

  test('TC-NAV-03: Verify B2B Agent portal link points to correct domain', async ({ isMobile }) => {
    if (isMobile) {
      await homePage.mobileMenuButton.click();
      const mobileB2B = homePage.page.locator('aside a[href*="agent.billetix.dz"]');
      await expect(mobileB2B).toBeVisible();
      await expect(mobileB2B).toHaveAttribute('href', 'https://agent.billetix.dz/login');
    } else {
      await expect(homePage.b2bLoginButton).toBeVisible();
      await expect(homePage.b2bLoginButton).toHaveAttribute('href', 'https://agent.billetix.dz/login');
    }
  });

  test('TC-NAV-04: Verify value proposition feature cards in footer/main', async ({ page }) => {
    // Verify 4 key trust badges
    const bestPrice = page.locator('text=Best Price Guarantee');
    const easyBooking = page.locator('text=Easy and Instance Booking');
    const payWay = page.locator('text=Pay the Way You Want');
    const customerCare = page.locator('text=Customer Care 24/7');

    await expect(bestPrice).toBeVisible();
    await expect(easyBooking).toBeVisible();
    await expect(payWay).toBeVisible();
    await expect(customerCare).toBeVisible();
  });
});
