# ✈️ Billetix (billetix.dz) - 5-Day Industrial QA & Test Automation Master Plan

**Target Application:** [https://billetix.dz](https://billetix.dz)  
**Scope:** 100% UI Coverage, Functional E2E (Playwright + TypeScript), Non-Functional Testing (k6 Load, OWASP Security, WCAG 2.1 AA a11y, RTL), and CI/CD Pipeline.  
**Execution Target:** 5 Days (Systematic Day-by-Day Execution)  
**Version:** 1.0.0 (Production Grade)  

---

## 📊 Summary Coverage Roadmap

| Metric / Domain | Current Baseline | Target (End of Day 5) | Tooling |
| :--- | :---: | :---: | :--- |
| **UI Component & Visuals** | ~70% | **100%** | Playwright Locator assertions, Viewports, Responsive Breakpoints |
| **Flight Search & Matrix Engine** | ~80% | **100%** | Parametric Data-Driven Tests, Date boundary, Multi-pax constraints |
| **Passenger Validation (ICAO)** | ~75% | **100%** | Positive/Negative validation, DOB, Passport expiry rules |
| **Checkout, Payment & PNR** | ~40% (Failed in TC-CHK-01) | **100%** | Resilient Locators, Network Route Mocking (CIB/Edahabia/Visa) |
| **Performance & Load Testing** | 0% | **100%** | Grafana k6 (100-500 VUs, Stress, Spike, Soak) |
| **Security & Vulnerabilities** | 0% | **100%** | OWASP Top 10 (IDOR/BOLA on PNR, Rate limiting, Card masking) |
| **Accessibility & Localization** | ~60% | **100%** | @axe-core/playwright (WCAG 2.1 AA), Arabic RTL Mirroring |
| **Cross-Browser & CI/CD** | 2 browsers local | **100%** | Chromium, Firefox, WebKit, Mobile + GitHub Actions & Allure |

---

## 🗓️ Day 1: UI Baseline, Framework Stabilization & Flaky Test Fixes

### 🎯 Primary Goal:
Fix current failure in `07-passenger-checkout-flow.spec.ts`, stabilize dynamic GDS search result loading, and establish 100% UI component verification.

### 📝 Action Items:
1. **Fix `TC-CHK-01` Navigation Timeout in `pages/CheckoutPage.ts`:**
   - Investigate why `this.page.waitForURL(/\/flight\/checkout/i)` timed out at 20,000ms.
   - Replace brittle URL wait with explicit flight selection triggers, ensuring search card render and button interactability.
   - Add handling for dynamic flight booking modals, seat locks, or re-pricing alerts.
2. **Comprehensive UI Baseline Test (`tests/01-ui-components-baseline.spec.ts`):**
   - Header: Logo, Currency selector (DZD/EUR/USD), Language switcher (AR/FR/EN), B2B Agent portal link, Login/Register modal button.
   - Footer: Social links, payment logos (CIB, Edahabia, Visa, Mastercard), copyright, contact info, terms & conditions.
   - Navigation & Dead-links: Automated crawler checking all anchor tags for `404/500` status codes.
   - Global console error listener: Ensure zero unhandled JavaScript errors or failed network requests.
3. **Responsive Viewport Matrix:**
   - Desktop (1920x1080), Laptop (1366x768), Tablet (768x1024), Mobile (375x812 - iPhone/Pixel).
   - Verify hamburger menu toggles, search widget collapse, and sticky booking bars.

### 📦 Day 1 Deliverables:
- [ ] Updated and passing `pages/CheckoutPage.ts` and `tests/07-passenger-checkout-flow.spec.ts`.
- [ ] New `tests/01-ui-components-baseline.spec.ts` with 100% visual component coverage.
- [ ] All 60+ tests passing cleanly across Chromium and Mobile Chrome.

---

## 🗓️ Day 2: Deep Flight Search Matrix, Filters & Passenger Validation

### 🎯 Primary Goal:
Cover 100% of all search combinations, live filtering/sorting edge cases, and strict international flight passenger constraints (ICAO).

### 📝 Action Items:
1. **Search Widget Permutations (`tests/02-flight-search-matrix.spec.ts`):**
   - Journey Types: One-Way, Round-Trip.
   - Route Rules: Domestic (ALG to ORN), International (ALG to CDG/IST), Same-city rejection (`ALG -> ALG` error alert).
   - Passenger Combinations:
     - 1 Adult.
     - 2 Adults + 2 Children + 1 Infant.
     - Infant constraint: `Infants > Adults` must be prohibited/disabled.
     - GDS Maximum Limit: Max 9 total passengers.
   - Date Boundary Rules: Past dates disabled, return date cannot be before departure date, max 360-day advance booking.
2. **Search Results Filter & Sort (`tests/03-search-results-filter-deep.spec.ts`):**
   - Airlines filter: Air Algérie, Tassili Airlines, Turkish Airlines (toggle and verify card count).
   - Stop count filter: Non-stop vs 1 Stop vs 2+ Stops.
   - Price range slider: Drag minimum/maximum price and assert all listed fares are within range.
   - Sorting algorithm verification:
     - Sort by "Cheapest": Verify monotonically non-decreasing prices ($P_1 \le P_2 \le ... \le P_n$).
     - Sort by "Fastest": Verify duration ordering.
3. **Passenger Information Form & Validation (`tests/04-passenger-validation-deep.spec.ts`):**
   - Title vs Gender sync (Mr = Male, Mrs/Ms = Female).
   - Age vs Passenger Category:
     - Adult: $\ge 12$ years.
     - Child: $2 - 11$ years.
     - Infant: $< 2$ years.
   - Passport Expiry: Must be valid for at least 6 months from departure date.
   - ICAO Name compliance: English alphabets only (prevent special characters / digits).

### 📦 Day 2 Deliverables:
- [ ] `tests/02-flight-search-matrix.spec.ts`
- [ ] `tests/03-search-results-filter-deep.spec.ts`
- [ ] `tests/04-passenger-validation-deep.spec.ts`
- [ ] Comprehensive data-driven test dataset in `data/flightSearchMatrix.json`.

---

## 🗓️ Day 3: Checkout, Payment Gateways (CIB/Edahabia/Card) & PNR Lifecycle

### 🎯 Primary Goal:
Automate the critical financial transaction flow, seat lock countdowns, payment gateway sandboxes/mocks, and ticket generation.

### 📝 Action Items:
1. **Fare Breakdown & Dynamic Pricing Calculation:**
   - Verify Base Fare + Airport Taxes + Fuel Surcharge + Baggage Add-on = Grand Total.
   - Multi-passenger arithmetic: Verify Total = $(Pax_{adult} \times Fare_{adult}) + (Pax_{child} \times Fare_{child}) + (Pax_{infant} \times Fare_{infant})$.
2. **Session Expiration & Seat Lock:**
   - 15-minute countdown timer validation.
   - Verify proper alert/modal and graceful redirect when session expires without booking loss corruption.
3. **Payment Gateway Mocking (`utils/paymentMocks.ts`):**
   - Since live real-money transactions cannot be completed repeatedly in automated CI:
     - Use Playwright's `page.route()` to intercept SATIM / CIB / Edahabia gateway callbacks.
     - Scenario A: Payment Approved -> Redirects to `/booking/confirmation` with PNR.
     - Scenario B: Payment Declined (Insufficient Funds) -> Retains passenger details, displays error message.
     - Scenario C: User cancels payment / closes 3DS window -> Returns to checkout safely without double-debiting.
4. **Order Confirmation & Post-Booking Management:**
   - Verify generated 6-character PNR format (Alphanumeric).
   - Verify E-ticket details (Passenger name, Flight number, Cabin class, Baggage allowance).
   - Verify PDF Download trigger and email notification dispatch trigger.

### 📦 Day 3 Deliverables:
- [ ] `pages/PaymentMockPage.ts` and `utils/paymentMocks.ts`.
- [ ] `tests/07-checkout-payment-pnr.spec.ts` covering success, failure, and edge cases.
- [ ] Complete E2E booking lifecycle automated.

---

## 🗓️ Day 4: Non-Functional Engineering (k6 Load, OWASP Security & a11y)

### 🎯 Primary Goal:
Ensure the platform scales under high traffic, complies with security standards (OWASP Web Top 10), meets WCAG 2.1 AA accessibility, and properly mirrors for Arabic RTL.

### 📝 Action Items:
1. **Performance & Load Testing with k6 (`perf/`):**
   - Install/Configure Grafana k6.
   - **Test 1: Search Endpoint Spike & Load (`perf/flight-search-load.js`):**
     - 50 to 300 concurrent Virtual Users (VUs) simulating flash sales or holiday bookings.
     - Thresholds: $p(95) < 2500\text{ms}$, HTTP Failure Rate $< 1\%$.
   - **Test 2: Stress & Soak Test (`perf/soak-test.js`):**
     - Sustained traffic for 15 minutes to detect memory leaks, unclosed database pools, or slow degradation.
2. **Security Testing (OWASP Web Top 10):**
   - **BOLA / IDOR Verification:**
     - Attempt accessing Booking confirmation `/api/booking/{PNR}` or `/manage-booking` with an unauthorized user account or modified PNR.
   - **Sensitive Data Exposure:**
     - Assert that passport numbers, CVV, or card numbers are never logged in browser localStorage, cookies, or console logs in plain text.
   - **Rate Limiting & Anti-Scraping Check:**
     - Rapidly fire 50 search requests within 5 seconds and verify 429 Too Many Requests or Cloudflare challenge.
   - **Input Sanitization (XSS / SQLi):**
     - Inject payload `<script>alert(1)</script>` into search queries and passenger names; ensure sanitized output.
3. **Accessibility (WCAG 2.1 AA) & RTL Arabic Localization:**
   - Full automated accessibility audit using `@axe-core/playwright` across Home, Search, Checkout, and Support.
   - Keyboard Navigation Test: Complete flight search using only `Tab`, `Arrow Keys`, `Enter`, and `Escape`.
   - Arabic RTL Audit: Confirm `dir="rtl"`, mirrored icons, aligned text, and correct currency symbol placement (`د.ج` / `DZD`).

### 📦 Day 4 Deliverables:
- [ ] k6 performance scripts in `perf/` directory with automated HTML summary reports.
- [ ] `tests/09-security-owasp.spec.ts`.
- [ ] Expanded `tests/05-arabic-rtl-localization.spec.ts` & `tests/06-accessibility-audit.spec.ts`.

---

## 🗓️ Day 5: Cross-Browser Grid, CI/CD Pipeline, Allure Dashboard & Sign-Off

### 🎯 Primary Goal:
Execute the entire test suite across all target browsers, configure automated CI/CD runs on GitHub Actions, produce Allure reporting dashboards, and issue the final QA Sign-Off report.

### 📝 Action Items:
1. **Cross-Browser & Cross-Device Matrix:**
   - Configure `playwright.config.ts` projects:
     - `Desktop Chrome` (Chromium)
     - `Desktop Firefox` (Gecko)
     - `Desktop Safari` (WebKit)
     - `Mobile Chrome` (Pixel 7)
     - `Mobile Safari` (iPhone 14 / WebKit)
2. **CI/CD Pipeline Setup (`.github/workflows/playwright.yml`):**
   - Trigger on Push to `main`/`develop` and Pull Requests.
   - Scheduled Nightly Regression runs (2:00 AM UTC).
   - Automated report publication (GitHub Pages or artifacts).
   - Slack / Discord webhook alerts on test failure.
3. **Allure Executive Reporting Integration:**
   - Install `allure-playwright` and configure metadata (epics, features, stories, severity).
   - Generate rich interactive dashboard showing historical execution trends, duration graphs, and failure categories.
4. **Final Test Summary & Sign-Off Document (`docs/FINAL_QA_SIGN_OFF_REPORT.md`):**
   - Requirements Traceability Matrix (RTM) linking all manual test cases (`docs/MANUAL_TEST_PLAN.md`) to automated tests.
   - Defect log summary with severity, priority, and steps to reproduce.
   - Production readiness certificate.

### 📦 Day 5 Deliverables:
- [ ] `.github/workflows/playwright.yml` configured and verified.
- [ ] Allure reporting setup with command `npm run report:allure`.
- [ ] `docs/FINAL_QA_SIGN_OFF_REPORT.md` with 100% test traceability.

---

## 🛠️ Quick Commands Reference for Execution

```bash
# Day 1: Run headed baseline & debug checkout
npm run test:headed -- tests/07-passenger-checkout-flow.spec.ts

# Day 2: Run search matrix and passenger validations
npx playwright test tests/02-flight-search.spec.ts tests/03-search-results-filter.spec.ts tests/04-auth-and-passenger-validation.spec.ts

# Day 3: Run checkout & payment flow
npx playwright test tests/07-passenger-checkout-flow.spec.ts

# Day 4: Run a11y, RTL and k6 load tests
npx playwright test tests/05-arabic-rtl-localization.spec.ts tests/06-accessibility-audit.spec.ts
# Run k6 load test:
# k6 run perf/flight-search-load.js

# Day 5: Run full regression across all browsers & generate report
npx playwright test
npx playwright show-report
```

---

*Plan created on: 2026-09-22. Ready to be executed sequentially.*
