# Billetix (billetix.dz) - 5-Day Industrial QA & Test Automation Master Plan

**Target Application:** [https://billetix.dz](https://billetix.dz)  
**Scope:** 100% UI Coverage, Functional Positive & Negative E2E (Playwright + TypeScript), Non-Functional Testing (k6 Load, OWASP Security, WCAG 2.1 AA a11y, RTL), and CI/CD Pipeline.  
**Execution Target:** 5 Days (Systematic Day-by-Day Execution)  
**Version:** 1.1.0 (Production Grade)  

---

## Summary Coverage Roadmap

| Metric / Domain | Day 1 Completed Baseline | Target (End of Day 5) | Tooling |
| :--- | :---: | :---: | :--- |
| **UI Component & Visuals** | 100% Baseline Verified | 100% | Playwright Locator assertions, Viewports, Responsive Breakpoints |
| **Flight Search & Matrix Engine** | 80% (Basic One-Way) | 100% (Positive + Negative Matrix) | Parametric Data-Driven Tests, Date boundary, Multi-pax constraints |
| **Passenger Validation (ICAO)** | 75% | 100% (Strict Boundary + Negative) | Positive/Negative validation, DOB, Passport expiry rules |
| **Checkout, Payment & PNR** | 100% Form & Routing | 100% (Mocked Gateway Success/Declined) | Resilient Locators, Network Route Mocking (CIB/Edahabia/Visa) |
| **Performance & Load Testing** | 0% | 100% | Grafana k6 (100-500 VUs, Stress, Spike, Soak) |
| **Security & Vulnerabilities** | 0% | 100% | OWASP Top 10 (IDOR/BOLA on PNR, Rate limiting, Card masking) |
| **Accessibility & Localization** | 80% (Axe-core passing) | 100% | @axe-core/playwright (WCAG 2.1 AA), Arabic RTL Mirroring |
| **Cross-Browser & CI/CD** | Chromium + Mobile Chrome | 100% (Chromium, Firefox, WebKit, Mobile) | GitHub Actions CI/CD & Allure Reporting |

---

## Positive vs. Negative Testing Matrix

| Module | Positive Test Scenarios | Negative & Boundary Test Scenarios |
| :--- | :--- | :--- |
| **Search Widget** | Valid domestic route (ALG to ORN), future date (+7d), 1-9 passengers, round-trip with return date after departure. | 1. Same origin and destination (ALG -> ALG) rejected.<br>2. Past calendar dates disabled.<br>3. Return date earlier than departure date blocked.<br>4. Infant count > Adult count prohibited.<br>5. Total passengers > 9 blocked (GDS limit). |
| **Results & Filter** | Active flight listing, cheapest-first ascending price sort, fastest duration sort, airline filters toggle. | 1. Zero results handling for unavailable routes.<br>2. Filter range slider set to $0 or out-of-bound prices.<br>3. Network timeout or 503 backend fallback state. |
| **Passenger Form** | Valid names (Latin A-Z), valid phone, adult (>=12y), child (2-11y), passport valid > 6 months. | 1. Name fields with digits, emojis, or special characters (`ICAO` violation).<br>2. Passport expiry date < 6 months from travel date.<br>3. Age vs category mismatch (e.g. adult DOB in child category).<br>4. Missing mandatory fields submission rejection. |
| **Checkout & Pricing** | Accurate fare arithmetic (Base + Taxes + Surcharges = Total), valid coupon deduction. | 1. Invalid or expired coupon code rejection alert.<br>2. 15-minute session expiration / seat release timeout.<br>3. Client-side price tampering detection on submit. |
| **Payment Gateway** | Successful SATIM CIB / Edahabia transaction, valid 3DS OTP confirmation. | 1. Insufficient card balance rejection.<br>2. Invalid 3DS OTP submission handling.<br>3. User cancellation mid-gateway redirect.<br>4. Double-click idempotency protection against duplicate charges. |
| **Authentication** | Valid login with registered credentials, successful Google OAuth redirection. | 1. Invalid email format or incorrect password error.<br>2. Registration with duplicate registered email.<br>3. Password mismatch in confirmation field.<br>4. Weak password complexity violation (< 6 chars). |

---

## Day 1: UI Baseline, Framework Stabilization & Flaky Test Fixes (COMPLETED)

### Status: COMPLETED (70 / 70 Tests Passed - 0 Failures)

### Accomplishments:
- [x] Fixed `TC-CHK-01` navigation timeout and React DOM detachment in `pages/CheckoutPage.ts`.
- [x] Configured local workers concurrency (`workers: 2`) and navigation timeout (`40000ms`) in `playwright.config.ts`.
- [x] Added cold TLS connection fallback in `pages/BasePage.ts`.
- [x] Created `tests/01-ui-components-baseline.spec.ts` (10 tests: Header, Footer, PCI-DSS badges, Zero console errors, Dead-link crawler, Multi-viewport responsive checks).
- [x] Fixed mobile viewport scroll issue in `pages/HomePage.ts:closeTravellersModal()`.
- [x] Documented Tablet (768px) breakpoint horizontal container observation.

---

## Day 2: Deep Flight Search Matrix, Filters & Passenger Validation

### Primary Goal:
Cover 100% of all search combinations, live filtering/sorting edge cases, and strict international flight passenger constraints (ICAO) with both positive and negative suites.

### Action Items:
1. **Search Widget Permutations & Negative Tests (`tests/02-flight-search-matrix.spec.ts`):**
   - Positive Journeys: One-Way, Round-Trip.
   - Negative Route Rules: Same-city rejection (`ALG -> ALG` validation message).
   - Negative Passenger Rules:
     - Infant constraint: `Infants > Adults` must be prohibited/disabled.
     - Maximum 9 passengers cap.
   - Negative Date Rules: Past dates disabled, return date cannot precede departure date, max 360-day advance booking.
2. **Search Results Filter & Sort (`tests/03-search-results-filter-deep.spec.ts`):**
   - Airlines filter: Air Algérie, Tassili Airlines, Turkish Airlines (toggle and verify card count).
   - Stop count filter: Non-stop vs 1 Stop vs 2+ Stops.
   - Price range slider: Drag minimum/maximum price and assert all listed fares are within range.
   - Sorting algorithm verification:
     - Sort by "Cheapest": Verify monotonically non-decreasing prices ($P_1 \le P_2 \le ... \le P_n$).
     - Sort by "Fastest": Verify duration ordering.
3. **Passenger Information Form & Strict Negative Validation (`tests/04-passenger-validation-deep.spec.ts`):**
   - Title vs Gender sync (Mr = Male, Mrs/Ms = Female).
   - Age vs Passenger Category:
     - Adult: >= 12 years.
     - Child: 2 - 11 years.
     - Infant: < 2 years.
   - Negative: Passport Expiry < 6 months from departure date rejected.
   - Negative: Special characters / numbers in name rejected.
   - Negative: Empty mandatory field error messages.

### Day 2 Deliverables:
- [ ] `tests/02-flight-search-matrix.spec.ts`
- [ ] `tests/03-search-results-filter-deep.spec.ts`
- [ ] `tests/04-passenger-validation-deep.spec.ts`
- [ ] Comprehensive data-driven test dataset in `data/flightSearchMatrix.json`.

---

## Day 3: Checkout, Payment Gateways (CIB/Edahabia/Card) & PNR Lifecycle

### Primary Goal:
Automate the critical financial transaction flow, seat lock countdowns, payment gateway sandboxes/mocks (success and failure), and ticket generation.

### Action Items:
1. **Fare Breakdown & Dynamic Pricing Calculation:**
   - Verify Base Fare + Airport Taxes + Fuel Surcharge + Baggage Add-on = Grand Total.
   - Multi-passenger arithmetic: Verify Total = $(Pax_{adult} \times Fare_{adult}) + (Pax_{child} \times Fare_{child}) + (Pax_{infant} \times Fare_{infant})$.
2. **Session Expiration & Seat Lock:**
   - 15-minute countdown timer validation.
   - Verify proper alert/modal and graceful redirect when session expires without booking loss corruption.
3. **Payment Gateway Mocking (`utils/paymentMocks.ts`):**
   - Use Playwright's `page.route()` to intercept SATIM / CIB / Edahabia gateway callbacks:
     - Positive: Payment Approved -> Redirects to `/booking/confirmation` with PNR.
     - Negative 1: Payment Declined (Insufficient Funds) -> Retains passenger details, displays error message.
     - Negative 2: User cancels payment / closes 3DS window -> Returns to checkout safely without double-debiting.
     - Negative 3: Invalid coupon code rejection alert.
4. **Order Confirmation & Post-Booking Management:**
   - Verify generated 6-character PNR format (Alphanumeric).
   - Verify E-ticket details (Passenger name, Flight number, Cabin class, Baggage allowance).
   - Verify PDF Download trigger and email notification dispatch trigger.

### Day 3 Deliverables:
- [ ] `pages/PaymentMockPage.ts` and `utils/paymentMocks.ts`.
- [ ] `tests/07-checkout-payment-pnr.spec.ts` covering success, failure, and edge cases.
- [ ] Complete E2E booking lifecycle automated.

---

## Day 4: Non-Functional Engineering (k6 Load, OWASP Security & a11y)

### Primary Goal:
Ensure the platform scales under high traffic, complies with security standards (OWASP Web Top 10), meets WCAG 2.1 AA accessibility, and properly mirrors for Arabic RTL.

### Action Items:
1. **Performance & Load Testing with k6 (`perf/`):**
   - Install/Configure Grafana k6.
   - Search Endpoint Spike & Load (`perf/flight-search-load.js`): 50 to 300 concurrent Virtual Users (VUs). Thresholds: $p(95) < 2500\text{ms}$, HTTP Failure Rate $< 1\%$.
   - Stress & Soak Test (`perf/soak-test.js`): Sustained traffic for 15 minutes.
2. **Security Testing (OWASP Web Top 10):**
   - BOLA / IDOR Verification: Unauthorized PNR access checks.
   - Sensitive Data Exposure: Ensure cards, CVVs, passwords masked in localStorage/logs.
   - Rate Limiting: 50 rapid requests within 5 seconds trigger 429 status.
   - Input Sanitization (XSS / SQLi): Inject payloads into search queries and passenger names.
3. **Accessibility (WCAG 2.1 AA) & RTL Arabic Localization:**
   - Full automated accessibility audit using `@axe-core/playwright`.
   - Keyboard Navigation Test: Complete flight search using only `Tab`, `Arrow Keys`, `Enter`, and `Escape`.
   - Arabic RTL Audit: Confirm `dir="rtl"`, mirrored icons, aligned text, and correct currency symbol placement (`د.ج` / `DZD`).

### Day 4 Deliverables:
- [ ] k6 performance scripts in `perf/` directory with automated HTML summary reports.
- [ ] `tests/09-security-owasp.spec.ts`.
- [ ] Expanded `tests/05-arabic-rtl-localization.spec.ts` & `tests/06-accessibility-audit.spec.ts`.

---

## Day 5: Cross-Browser Grid, CI/CD Pipeline, Allure Dashboard & Sign-Off

### Primary Goal:
Execute the entire test suite across all target browsers, configure automated CI/CD runs on GitHub Actions, produce Allure reporting dashboards, and issue the final QA Sign-Off report.

### Action Items:
1. **Cross-Browser & Cross-Device Matrix:**
   - Configure `playwright.config.ts` projects: `Desktop Chrome`, `Desktop Firefox`, `Desktop Safari`, `Mobile Chrome`, `Mobile Safari`.
2. **CI/CD Pipeline Setup (`.github/workflows/playwright.yml`):**
   - Trigger on Push to `main` and Pull Requests.
   - Scheduled Nightly Regression runs.
3. **Allure Executive Reporting Integration:**
   - Install `allure-playwright` and generate interactive dashboard.
4. **Final Test Summary & Sign-Off Document (`docs/FINAL_QA_SIGN_OFF_REPORT.md`):**
   - Requirements Traceability Matrix (RTM) linking all manual and automated test cases.
   - Defect log summary with severity, priority, and steps to reproduce.

### Day 5 Deliverables:
- [ ] `.github/workflows/playwright.yml` configured and verified.
- [ ] Allure reporting setup with command `npm run report:allure`.
- [ ] `docs/FINAL_QA_SIGN_OFF_REPORT.md` with 100% test traceability.

---

## Quick Commands Reference for Execution

```bash
# Day 1: Run headed baseline & debug checkout
npm run test:headed -- tests/01-ui-components-baseline.spec.ts tests/07-passenger-checkout-flow.spec.ts

# Day 2: Run search matrix and passenger validations
npx playwright test tests/02-flight-search.spec.ts tests/03-search-results-filter.spec.ts tests/04-auth-and-passenger-validation.spec.ts

# Day 3: Run checkout & payment flow
npx playwright test tests/07-passenger-checkout-flow.spec.ts

# Day 4: Run a11y, RTL and k6 load tests
npx playwright test tests/05-arabic-rtl-localization.spec.ts tests/06-accessibility-audit.spec.ts

# Day 5: Run full regression across all browsers & generate report
npx playwright test
npx playwright show-report
```

---

*Plan updated on: 2026-09-22. Version 1.1.0 with complete Positive vs Negative Matrix.*
