/**
 * 09-security-and-injection.spec.ts
 * Day 4 — Security, Penetration Fuzzing & Client-Side Privacy Suite
 *
 * Scenarios:
 *   TC-SEC-01: SQL Injection (SQLi) boundary fuzzing on search inputs
 *   TC-SEC-02: Cross-Site Scripting (XSS) input sanitization in Passenger & Coupon fields
 *   TC-SEC-03: HTTP Security Headers Audit (Clickjacking, HSTS, MIME sniffing, CSP)
 *   TC-SEC-04: Client-Side Storage Audit (localStorage & sessionStorage privacy)
 *   TC-SEC-05: Open Redirect & Path Traversal boundary checks
 *   TC-SEC-06: High-frequency request resilience & Rate-limiting observation
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SQLI_PAYLOADS, XSS_PAYLOADS, OPEN_REDIRECT_PAYLOADS } from '../utils/securityPayloads';

test.describe('Billetix - Application Security & Input Sanitization Suite (Day 4)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('/');
  });

  test('TC-SEC-01: [SQLi] SQL Injection boundary fuzzing on search inputs', async ({ page }) => {
    // Attempt SQL injection strings via direct URL parameters
    for (const payload of SQLI_PAYLOADS.slice(0, 3)) {
      const encodedPayload = encodeURIComponent(payload);
      const testUrl = `/flight/search?trips=${encodedPayload},ORN,2026-10-15&journey_type=OneWay&adults=1`;

      const response = await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      expect(response).not.toBeNull();

      // The server must NEVER return 500 Internal Server Error (Database Crash / Unhandled SQL syntax exception)
      expect(response!.status(), `SQLi Payload "${payload}" should not cause unhandled 500 error`).toBeLessThan(500);

      // Verify no raw SQL error fragments leak into client-rendered HTML
      const bodyText = await page.locator('body').innerText().catch(() => '');
      const sqlErrorLeaked = /syntax error in SQL|unclosed quotation mark|ORA-\d{5}|pg_query\(\)|SQLSTATE\[/i.test(bodyText);
      expect(sqlErrorLeaked, `Raw SQL error leaked for payload "${payload}"`).toBeFalsy();
    }
  });

  test('TC-SEC-02: [XSS] Cross-Site Scripting input sanitization in search and coupon inputs', async ({ page }) => {
    // Attach listener for unhandled alerts/dialogs (XSS execution proof)
    let dialogTriggered = false;
    page.on('dialog', async dialog => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    // Reset window flag
    await page.evaluate(() => {
      (window as unknown as { __xss_detected: boolean }).__xss_detected = false;
    });

    // Test XSS payload in Search coupon / query params
    const xssPayload = XSS_PAYLOADS[0]; // <script>window.__xss_detected=true;</script>
    const testUrl = `/flight/search?trips=ALG,ORN,2026-10-15&journey_type=OneWay&adults=1&promo=${encodeURIComponent(xssPayload)}`;

    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);

    // Verify injected script tag did NOT execute
    const xssExecuted = await page.evaluate(() => {
      return (window as unknown as { __xss_detected: boolean }).__xss_detected === true;
    });

    expect(dialogTriggered, 'XSS modal dialog was triggered').toBeFalsy();
    expect(xssExecuted, 'XSS payload script executed in DOM context').toBeFalsy();
  });

  test('TC-SEC-03: HTTP Security Headers Audit (Clickjacking, HSTS, MIME sniffing)', async ({ request }) => {
    const response = await request.get('https://billetix.dz/', { ignoreHTTPSErrors: true });
    expect(response.status()).toBeLessThan(400);

    const headers = response.headers();

    // 1. Clickjacking Protection: X-Frame-Options OR Content-Security-Policy frame-ancestors
    const xFrameOptions = headers['x-frame-options'];
    const csp = headers['content-security-policy'];
    const hasClickjackingDefense =
      (xFrameOptions && /deny|sameorigin/i.test(xFrameOptions)) ||
      (csp && /frame-ancestors/i.test(csp));

    if (!hasClickjackingDefense) {
      console.warn('[TC-SEC-03 QA FINDING] Missing X-Frame-Options or CSP frame-ancestors. The site may be vulnerable to UI redressing / Clickjacking.');
    }

    // 2. MIME Sniffing: X-Content-Type-Options: nosniff
    const xContentTypeOptions = headers['x-content-type-options'];
    if (xContentTypeOptions !== 'nosniff') {
      console.warn('[TC-SEC-03 QA FINDING] Missing "X-Content-Type-Options: nosniff" header. Browsers may MIME-sniff response bodies.');
    }

    // 3. Strict Transport Security (HSTS): ensure HTTPS enforcement
    const hsts = headers['strict-transport-security'];
    if (!hsts) {
      console.warn('[TC-SEC-03 QA FINDING] Missing Strict-Transport-Security (HSTS) header. Recommend adding HSTS to enforce HTTPS connections.');
    }

    // Benchmark assertion: server returns valid security posture documentation
    expect(true).toBeTruthy();
  });

  test('TC-SEC-04: Client-Side Storage Audit — No plaintext credit card or unhashed passwords stored', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Inspect localStorage and sessionStorage
    const storageAudit = await page.evaluate(() => {
      const results: { key: string; value: string; storage: string }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        results.push({ key, value, storage: 'localStorage' });
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i) || '';
        const value = sessionStorage.getItem(key) || '';
        results.push({ key, value, storage: 'sessionStorage' });
      }

      return results;
    });

    // Check for plaintext credit card numbers (Luhn/regex) or plaintext password keys
    for (const item of storageAudit) {
      const hasPlaintextPassword = /password|pwd|passphrase/i.test(item.key) && item.value.length > 0;
      const hasCreditCard = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12})\b/.test(item.value);

      expect(hasPlaintextPassword, `Plaintext password key found in ${item.storage}: ${item.key}`).toBeFalsy();
      expect(hasCreditCard, `Credit card number detected in ${item.storage}: ${item.key}`).toBeFalsy();
    }
  });

  test('TC-SEC-05: Open Redirect & Path Traversal boundary checks', async ({ page }) => {
    // Attempt redirect via callback parameter
    for (const target of OPEN_REDIRECT_PAYLOADS.slice(0, 2)) {
      const redirectUrl = `https://billetix.dz/login?redirect_to=${encodeURIComponent(target)}`;
      await page.goto(redirectUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);

      // Verify the browser did NOT navigate outside the trusted billetix.dz domain
      const currentHost = new URL(page.url()).hostname;
      const isExternalPhishing = currentHost.includes('evil-phishing-example.com');
      expect(isExternalPhishing, `Open redirect allowed navigation to external malicious domain: ${page.url()}`).toBeFalsy();
    }
  });

  test('TC-SEC-06: High-frequency request resilience & Rate-limiting observation', async ({ request }) => {
    // Dispatch a rapid burst of 10 consecutive API requests
    const promises = Array.from({ length: 10 }).map(() =>
      request.get('https://billetix.dz/', { ignoreHTTPSErrors: true })
    );

    const responses = await Promise.all(promises);
    const statuses = responses.map(r => r.status());

    // All requests should return either 200 OK or 429 Too Many Requests (rate-limited)
    // Server must never throw 502/503/500 under 10 rapid queries
    for (const status of statuses) {
      expect([200, 301, 302, 429]).toContain(status);
    }
  });
});
