import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Billetix - Flight Search & Travellers Validation Suite', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('/');
  });

  test('TC-SRC-01: Verify journey type radio buttons toggle state', async () => {
    // Default should be OneWay
    await expect(homePage.oneWayRadio).toBeChecked();

    // Toggle RoundTrip
    await homePage.selectJourneyType('RoundTrip');
    await expect(homePage.roundTripRadio).toBeChecked();
    await expect(homePage.oneWayRadio).not.toBeChecked();

    // Toggle MultiCity
    await homePage.selectJourneyType('MultiCity');
    await expect(homePage.multiCityRadio).toBeChecked();
    await expect(homePage.roundTripRadio).not.toBeChecked();
  });

  test('TC-SRC-02: Verify travellers constraint - Infants count cannot exceed Adults count', async () => {
    await homePage.openTravellersModal();

    // Default is 1 Adult. Under 1 Adult, infant 0 and 1 are selectable, but 2+ must be disabled
    const isInfant2Disabled = await homePage.isInfantOptionDisabled(2);
    expect(isInfant2Disabled).toBeTruthy();

    const isInfant3Disabled = await homePage.isInfantOptionDisabled(3);
    expect(isInfant3Disabled).toBeTruthy();

    await homePage.closeTravellersModal();
  });

  test('TC-SRC-03: Verify search fields visibility (From, To, Departure, Search Button)', async () => {
    await expect(homePage.fromContainer).toBeVisible();
    await expect(homePage.toContainer).toBeVisible();
    await expect(homePage.departureDateContainer).toBeVisible();
    await expect(homePage.searchButton).toBeVisible();
  });
});
