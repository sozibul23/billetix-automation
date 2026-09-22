# Billetix Non-Functional Test Plan (NFT) ⚡🔒🌐

**Target Application:** [https://billetix.dz](https://billetix.dz/)  
**Platform Type:** B2C Online Travel Agency (OTA) & Flight Booking Engine  
**Testing Scope:** Performance, Security, Compatibility, Localization (RTL), Accessibility (a11y), Network Resilience

---

## 📑 Table of Contents
1. [Performance & Load Testing Strategy](#1-performance--load-testing-strategy)
2. [Security & Vulnerability Assessment (OWASP Top 10)](#2-security--vulnerability-assessment-owasp-top-10)
3. [Cross-Browser & Device Compatibility Matrix](#3-cross-browser--device-compatibility-matrix)
4. [Localization & Arabic RTL Layout Testing (i18n / L10n)](#4-localization--arabic-rtl-layout-testing-i18n--l10n)
5. [Accessibility (a11y - WCAG 2.1 AA Compliance)](#5-accessibility-a11y---wcag-21-aa-compliance)
6. [Network Resilience & Disaster Recovery](#6-network-resilience--disaster-recovery)

---

## 1. Performance & Load Testing Strategy

### 1.1 Client-Side Core Web Vitals Benchmarks
Performance targets measured using Google Lighthouse & Chrome DevTools on desktop (Cable) and mobile (4G):

| Metric | Target (Desktop) | Target (Mobile 4G) | Impact on Booking Experience |
| :--- | :---: | :---: | :--- |
| **LCP (Largest Contentful Paint)** | $\le 2.0\text{ s}$ | $\le 2.8\text{ s}$ | Hero flight search banner visibility |
| **FID / INP (Interaction to Next Paint)** | $\le 100\text{ ms}$ | $\le 200\text{ ms}$ | Airport autocomplete responsiveness |
| **CLS (Cumulative Layout Shift)** | $\le 0.05$ | $\le 0.1$ | Prevents accidental clicks on wrong flight card |
| **TTFB (Time to First Byte)** | $\le 400\text{ ms}$ | $\le 600\text{ ms}$ | Initial server response time |

### 1.2 Server-Side Load & Stress Testing Matrix (k6 / Apache JMeter)
Simulating user traffic during peak travel seasons (e.g., Summer holidays, Eid, Hajj/Umrah flights):

| Test Scenario | Virtual Users (VUs) | Duration | Ramp-up | Success Criteria |
| :--- | :---: | :---: | :---: | :--- |
| **Smoke Load Test** | 50 VUs | 5 mins | 1 min | 0% HTTP 5xx errors; 95th percentile response $< 1.5$s |
| **Peak Load Test** | 500 VUs | 30 mins | 5 mins | Search API response $< 3.5$s; Error rate $< 1\%$ |
| **Stress / Breakpoint Test** | 1,500 VUs | 20 mins | 10 mins | Identify server bottleneck, CPU/Memory spike $> 85\%$ |
| **Soak / Endurance Test** | 200 VUs | 4 hours | 10 mins | Zero memory leak; consistent DB connection pool |

### 1.3 Key API Endpoints Under Test:
1. `GET /` (Homepage document + static assets)
2. `GET /api/airports?q=...` (Airport autocomplete query)
3. `GET /flight/search?trips=...` (Flight GDS aggregation search)
4. `POST /api/bookings/hold` (Seat & PNR inventory hold)
5. `POST /api/payment/initiate` (SATIM / CIB gateway handoff)

---

## 2. Security & Vulnerability Assessment (OWASP Top 10)

### 2.1 High-Risk Security Test Scenarios

| Test ID | Vulnerability Area | Attack Vector / Test Procedure | Expected Security Defense |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **SQL / NoSQL Injection** | Inject `' OR '1'='1`, `1; DROP TABLE users;--` in Airport search, PNR lookup, and Passenger Name fields. | Query parameterized; inputs sanitized; zero raw database errors exposed. |
| **SEC-02** | **Cross-Site Scripting (XSS)** | Submit `<script>alert('XSS')</script>` or `<img src=x onerror=alert(1)>` in Passenger First/Last Name, Special Requests note. | HTML tags strictly encoded or stripped; script execution blocked by CSP headers. |
| **SEC-03** | **IDOR (Insecure Direct Object Reference)** | Change booking ID or PNR in confirmation URL `/booking/confirmation?pnr=OTHER_USER_PNR` or API `/api/bookings/{id}`. | HTTP 403 Forbidden / 401 Unauthorized; users cannot view other travelers' personal/passport data. |
| **SEC-04** | **Payment Tampering & Price Manipulation** | Intercept checkout request and modify price payload: change `total_amount=45000` to `total_amount=1`. | Server re-calculates price from database state; client-supplied prices are strictly ignored; transaction rejected. |
| **SEC-05** | **Sensitive Data Exposure (PCI-DSS)** | Inspect browser LocalStorage, SessionStorage, Console logs, and Network tab during payment. | Zero raw card numbers, CVVs, or bank credentials saved in browser storage or transmitted in plain text. |
| **SEC-06** | **Session Hijacking & Cookie Flags** | Inspect session cookies (`session_id`, `token`). | Cookies marked with `Secure`, `HttpOnly`, and `SameSite=Lax` or `Strict`. |
| **SEC-07** | **Rate Limiting & Anti-Scraping** | Fire 100 rapid flight search requests in 10 seconds via automation/cURL. | API throttles requests with HTTP 429 Too Many Requests; rate-limiting protects against fare scrapers. |
| **SEC-08** | **HTTPS & SSL/TLS Verification** | Test SSL grade using SSL Labs; attempt HTTP access. | Strict Transport Security (HSTS) enabled; all HTTP traffic auto-redirected to HTTPS (TLS 1.2/1.3). |

---

## 3. Cross-Browser & Device Compatibility Matrix

### 3.1 Device & OS Matrix

| Device Type | Operating System | Browser | Viewport Resolution | Test Priority |
| :--- | :--- | :--- | :--- | :---: |
| **Desktop High-Res** | Windows 11 | Google Chrome (Latest) | $1920 \times 1080$ | P1 (Primary) |
| **Desktop Standard** | Windows 10/11 | Microsoft Edge (Chromium) | $1366 \times 768$ | P1 |
| **Desktop Mac** | macOS Sonoma | Safari (v17+) | $1440 \times 900$ | P1 |
| **Desktop OpenSource**| Linux / Windows | Mozilla Firefox (Latest) | $1920 \times 1080$ | P2 |
| **Tablet** | iPadOS 17 | Mobile Safari (iPad Pro/Air) | $820 \times 1180$ | P2 |
| **Android Smartphone**| Android 14 | Chrome Mobile (Pixel 7 / Galaxy S23) | $412 \times 915$ | P1 (Mobile Primary) |
| **iOS Smartphone** | iOS 17 | Mobile Safari (iPhone 14 / 15) | $390 \times 844$ | P1 (Mobile Primary) |

### 3.2 Compatibility Checklist:
- [ ] Dropdown and select controls trigger native wheel on iOS/Android and custom dropdown on desktop.
- [ ] Date pickers work seamlessly on touch screens with tap gestures.
- [ ] Responsive drawer menu (`aside[role="dialog"]`) smoothly slides in/out without background bleed.
- [ ] Sticky "SEARCH" button stays visible on mobile without overlapping navigation bar.

---

## 4. Localization & Arabic RTL Layout Testing (i18n / L10n)

As an Algerian national platform, Billetix supports **Arabic (العربية)**, **French (Français)**, and **English**.

### 4.1 Arabic Right-to-Left (RTL) Testing Checklist
| Component | LTR (English / French) Behavior | RTL (Arabic) Expected Behavior | Pass / Fail |
| :--- | :--- | :--- | :---: |
| **Page Direction** | `dir="ltr"` | `dir="rtl"` applied on `<html>` or `<body>` tag | [ ] |
| **Navigation Bar** | Logo on Left, Login on Right | Logo on Right, Login on Left | [ ] |
| **Flight Direction Arrows** | Origin $\rightarrow$ Destination (Algiers $\rightarrow$ Paris) | Origin $\leftarrow$ Destination (الجزائر $\leftarrow$ باريس) | [ ] |
| **Form Labels & Placeholders** | Text aligned to Left | Text aligned to Right | [ ] |
| **Date Picker Calendar** | Days Monday $\rightarrow$ Sunday Left to Right | Calendar columns oriented Right to Left | [ ] |
| **Drawer Menu Slide** | Slides from Left (`-translate-x-full`) | Slides from Right (`rtl:translate-x-full`) | [ ] |
| **Chevron / Arrow Icons** | `chevron-right` points right | `chevron-right` flipped to point left | [ ] |

### 4.2 Currency & Number Localization
- [ ] Currency display: Algerian Dinar displayed as **`DZD`** or **`د.ج`** consistently across all screens.
- [ ] Thousand Separator: Ensure numbers formatted cleanly (e.g. `25 000 DZD` or `25,000 DZD`), no NaN or undefined values.
- [ ] Language switching persistence: User selection preserved during page reloads and checkout steps.

---

## 5. Accessibility (a11y - WCAG 2.1 AA Compliance)

### 5.1 WCAG 2.1 AA Checkpoints

| Guideline | Requirement | Test Method | Target |
| :--- | :--- | :--- | :--- |
| **1.4.3 Contrast (Minimum)** | Text and images of text have a contrast ratio of at least $4.5:1$ ($3:1$ for large text). | Axe DevTools / Color Contrast Analyzer | Brand primary button (`#F7AC1F`) text readability meets $4.5:1$. |
| **2.1.1 Keyboard Accessible** | All page functionality is operable through a keyboard interface without mouse. | Tab, Shift+Tab, Enter, Space, Arrow keys | Full flight search, date pickers, and checkout navigable via keyboard. |
| **2.4.7 Focus Visible** | Any keyboard operable user interface has an operable focus indicator. | Visual keyboard navigation inspection | Focused buttons, radio inputs, and textboxes display clear outline ring. |
| **4.1.2 Name, Role, Value** | Interactive elements have accessible names and ARIA roles. | Screen reader (NVDA / VoiceOver) | Screen reader announces "Travellers & Class, button, expanded/collapsed". |
| **2.5.5 Target Size** | Touch targets are at least $44 \times 44$ CSS pixels on mobile screens. | Chrome DevTools Element Inspector | All mobile counter buttons (+ / -) meet $\ge 44\text{px}$ touch target size. |

---

## 6. Network Resilience & Disaster Recovery

| Test Scenario | Test Condition | Expected Behavior |
| :--- | :--- | :--- |
| **Slow 3G Network Throttling** | 400ms RTT, 400kbps download | Loading spinners/skeletons displayed; buttons disabled during flight search to prevent multiple submissions. |
| **Network Disconnection During Search** | Internet cut mid-flight search | Graceful error toast: "Unable to connect to server. Please check your internet connection and retry." |
| **Network Drop During Payment Callback** | User completes payment at bank, but network drops before redirect to Billetix | Background webhook reconciles payment; ticket issued; notification email sent once connectivity resumes. |
| **Browser Back Button on Payment Gateway** | User presses Back on SATIM gateway page | Prevents session corruption; returns to checkout screen with option to resume or retry payment. |
| **Concurrent Booking of Last Seat** | 2 users book the last available seat simultaneously | First completed payment succeeds; second user gracefully notified: "Seat no longer available; fare updated." |
