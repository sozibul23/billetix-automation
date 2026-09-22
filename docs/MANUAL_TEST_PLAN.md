# Billetix Manual Test Plan & Test Case Repository 📋✈️

**Target Application:** [https://billetix.dz](https://billetix.dz/)  
**Platform Type:** B2C Online Travel Agency (OTA) & Flight Booking Engine  
**Testing Scope:** Comprehensive Manual Testing (Functional, Exploratory, Smoke, Sanity, Regression)

---

## 📑 Table of Contents
1. [Test Strategy & Execution Approach](#1-test-strategy--execution-approach)
2. [Module 1: Authentication & User Management (AUTH)](#module-1-authentication--user-management-auth)
3. [Module 2: Flight Search Widget & Parameters (SRCH)](#module-2-flight-search-widget--parameters-srch)
4. [Module 3: Flight Results, Sorting & Filtering (RSLT)](#module-3-flight-results-sorting--filtering-rslt)
5. [Module 4: Flight Details, Baggage & Fare Families (FARE)](#module-4-flight-details-baggage--fare-families-fare)
6. [Module 5: Passenger Information Form & Validation (PASS)](#module-5-passenger-information-form--validation-pass)
7. [Module 6: Pricing Summary & Add-ons (PRIC)](#module-6-pricing-summary--add-ons-pric)
8. [Module 7: Payment Gateway Processing (PAYM)](#module-7-payment-gateway-processing-paym)
9. [Module 8: Order Confirmation, PNR & E-Ticket (TICK)](#module-8-order-confirmation-pnr--e-ticket-tick)
10. [Module 9: Manage Booking & Customer Support (MGMT)](#module-9-manage-booking--customer-support-mgmt)

---

## 1. Test Strategy & Execution Approach

### Levels of Manual Testing:
- **Smoke Testing (1–2 hrs):** Quick verification of critical paths (Search Algiers to Oran -> Results loaded -> Passenger form rendered -> Checkout reached).
- **Sanity Testing:** Post-deployment check of recently modified modules (e.g., payment gateway updates or date picker changes).
- **Deep Functional Testing:** Boundary value analysis (BVA), equivalence partitioning (EP), positive and negative path validation across all 9 modules.
- **Exploratory & Ad-hoc Testing:** User-persona-based journeys (e.g., family traveling with infant, business traveler booking multi-city, user switching currencies mid-checkout).

---

## Module 1: Authentication & User Management (AUTH)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | B2C Registration with valid credentials | User on homepage | 1. Click "Login / Signup"<br>2. Click "Register here"<br>3. Fill Name, Email, Password, Phone<br>4. Click "Register" | Name: "Karim Benali"<br>Email: `unique@example.com`<br>Pass: `Pass@1234`<br>Phone: `0555123456` | Account created successfully; user logged in; profile avatar visible in header. | Critical |
| **TC-AUTH-02** | Registration with duplicate email | Existing account with test email | 1. Open Register modal<br>2. Enter registered email<br>3. Submit form | Email already in DB | Error alert: "Email already registered" or equivalent; form prevents submission. | High |
| **TC-AUTH-03** | Password complexity validation | User on Register modal | 1. Enter password with $< 6$ characters or only numbers | Pass: `12345` | Real-time helper text indicates weak password requirement; submit disabled. | Medium |
| **TC-AUTH-04** | Valid B2C Login & Session persistence | Registered user | 1. Click "Login"<br>2. Enter email & password<br>3. Click "Log In"<br>4. Refresh page | Valid user credentials | User logged in; user name shown; session persists after page reload. | Critical |
| **TC-AUTH-05** | Invalid password login attempt | Registered user | 1. Enter valid email with wrong password<br>2. Submit | Wrong password | Error message: "Invalid email or password"; password field cleared. | High |
| **TC-AUTH-06** | Forgot Password recovery flow | Registered user | 1. Click "Forgot Password?"<br>2. Enter email<br>3. Click Submit | `registered@example.com` | Success notification: "Reset link sent to your email"; email dispatched. | Medium |
| **TC-AUTH-07** | B2B Agent portal link redirection | Any user on homepage | 1. Click "B2B Agent Login" in navbar | N/A | Opens `https://agent.billetix.dz/login` in new tab with valid SSL certificate. | High |
| **TC-AUTH-08** | User Logout flow | Authenticated user | 1. Click Profile avatar<br>2. Select "Logout" | Active session | Session invalidated; redirected to homepage; Login button visible. | High |

---

## Module 2: Flight Search Widget & Parameters (SRCH)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SRCH-01** | One-Way search with valid domestic route | User on homepage | 1. Select "One Way"<br>2. From: Algiers (ALG)<br>3. To: Oran (ORN)<br>4. Departure: Today + 7 days<br>5. Travellers: 1 Adult<br>6. Click "SEARCH" | `ALG` to `ORN`, 1 Adult, Economy | Navigates to `/flight/search?trips=...`; search parameters match in query string. | Critical |
| **TC-SRCH-02** | Round-Trip search date validation | User on homepage | 1. Select "Round Trip"<br>2. Select Departure: 15th next month<br>3. Select Return date | Departure: 15th<br>Return: 22nd | Return date picker disables all dates prior to 15th; return date cannot be before departure. | Critical |
| **TC-SRCH-03** | Same Origin and Destination rejection | User on homepage | 1. Select From: Algiers (ALG)<br>2. Select To: Algiers (ALG)<br>3. Click Search | Origin = Dest = `ALG` | Error alert: "Origin and Destination cannot be the same"; search blocked. | High |
| **TC-SRCH-04** | Airport search autocomplete | User on homepage | 1. Click "From"<br>2. Type "Paris" or "CDG" | Keyword: "Paris" | Dropdown lists "Charles de Gaulle (CDG)" and "Orly (ORY)" with IATA codes. | High |
| **TC-SRCH-05** | Travellers constraint: Infants $\le$ Adults | User on homepage | 1. Open Travellers dropdown<br>2. Set Adults = 1<br>3. Inspect Infant buttons 2, 3, 4 | Adults: 1 | Buttons 2+ for Infants are disabled (`cursor-not-allowed`); infant count cannot exceed adults. | Critical |
| **TC-SRCH-06** | Maximum passenger limit (GDS rule: 9 max) | User on homepage | 1. Try selecting 7 Adults + 3 Children | Sum = 10 | Total travellers capped at 9; warning message or disabled buttons beyond 9. | High |
| **TC-SRCH-07** | Cabin Class selection persistence | User on homepage | 1. Open Travellers & Class<br>2. Select "Business Class"<br>3. Click Apply | Class: Business | Search input displays "Business Class"; search URL passes `cabin=business`. | Medium |
| **TC-SRCH-08** | Swap Origin & Destination button | User on homepage | 1. From: Algiers, To: Istanbul<br>2. Click Swap button (⇄) | `ALG` ⇄ `IST` | Origin becomes Istanbul and Destination becomes Algiers seamlessly. | Low |

---

## Module 3: Flight Results, Sorting & Filtering (RSLT)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-RSLT-01** | Flight cards data integrity | Search executed | 1. Inspect search results cards | Algiers to Paris | Each card displays: Airline logo, Flight Number, Departure/Arrival time, Airport codes, Duration, Stops, Price in DZD. | Critical |
| **TC-RSLT-02** | Sort by "Cheapest First" | Multiple flight cards | 1. Click "Cheapest"<br>2. Compare card prices top to bottom | Dynamic fares | Prices appear in strict ascending order (e.g. 25,000 DZD $\le$ 32,000 DZD). | High |
| **TC-RSLT-03** | Sort by "Fastest / Shortest Duration" | Multiple flight cards | 1. Click "Fastest" | Varying layovers | Cards ordered by total travel duration from shortest to longest. | Medium |
| **TC-RSLT-04** | Filter by Stops: Non-Stop only | Direct & connecting flights | 1. Check "Direct / Non-stop" filter checkbox | Multi-airline | All connecting/layover flights disappear; only direct flights remain visible. | High |
| **TC-RSLT-05** | Filter by Airline (e.g. Air Algérie) | Multiple carriers | 1. Check "Air Algérie" in airline filter list | Air Algérie, Turkish, AF | Only Air Algérie flights displayed; result counter updates accurately. | High |
| **TC-RSLT-06** | Price range slider interaction | Result set loaded | 1. Drag maximum price slider left | Slider: Min - Max | Flights priced above the slider limit are dynamically filtered out. | Medium |
| **TC-RSLT-07** | Zero search results state | Non-existent route | 1. Search route with no scheduled flights | Obscure pair | Friendly UI displayed: "No flights found for your selected route"; CTA: "Modify Search". | Medium |
| **TC-RSLT-08** | Session expiry / Inventory timeout | User on results page for 20+ mins | 1. Leave page idle for 20 mins<br>2. Click "Select Flight" | Stale search session | Warning dialog: "Fares may have changed. Please refresh search"; page refreshes inventory. | High |

---

## Module 4: Flight Details, Baggage & Fare Families (FARE)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-FARE-01** | Flight itinerary details drawer/modal | Flight card displayed | 1. Click "Flight Details" on any card | Outbound flight | Modal opens showing aircraft model, terminal number, layover duration, baggage allowance. | High |
| **TC-FARE-02** | Baggage policy verification | Flight card displayed | 1. Inspect baggage icons on card and modal | Economy class | Cabin baggage (e.g., 7kg) and Checked baggage (e.g., 23kg or 0 PC) clearly specified. | Critical |
| **TC-FARE-03** | Fare family selection (Saver vs Flex) | Flight with multiple tiers | 1. Select "Flex" option<br>2. Verify price difference | Saver vs Flex | Price increases by tier difference; refund/change fees updated to "Free cancellation". | High |
| **TC-FARE-04** | Fare rules & Cancellation policy | Fare details modal | 1. Click "Fare Rules / Refund Policy" | Selected carrier | Policy specifies non-refundable vs refundable terms, penalty fees, and no-show penalties. | High |

---

## Module 5: Passenger Information Form & Validation (PASS)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PASS-01** | Valid primary passenger entry | On passenger details page | 1. Select Title: "Mr"<br>2. First Name: "Sofiane"<br>3. Last Name: "Feghouli"<br>4. DOB: 1989-12-26<br>5. Passport: Valid number & expiry<br>6. Submit | Valid Adult data | Fields accepted without error; proceed button enabled. | Critical |
| **TC-PASS-02** | Name format restrictions (No numbers/special chars) | Passenger form | 1. First Name: `Karim@123`<br>2. Last Name: `Ben_ali!` | Alphanumeric / symbols | Inline validation: "Names must contain letters only (A-Z) matching your passport". | High |
| **TC-PASS-03** | Adult age validation ($\ge 12$ years) | Passenger form (Adult) | 1. Enter DOB for a 10-year-old in Adult form | DOB: 2016-01-01 | Error: "Adult passenger must be at least 12 years old at time of travel". | Critical |
| **TC-PASS-04** | Child age validation (2–12 years) | Passenger form (Child) | 1. Enter DOB for a 14-year-old in Child form | DOB: 2012-01-01 | Error: "Child passenger age must be between 2 and 12 years". | Critical |
| **TC-PASS-05** | Infant age validation ($< 2$ years) | Passenger form (Infant) | 1. Enter DOB for a 3-year-old in Infant form | DOB: 2023-01-01 | Error: "Infant passenger must be under 2 years of age". | Critical |
| **TC-PASS-06** | Passport expiration date boundary | International flight | 1. Enter passport expiry date 2 months from departure date | Expiry $< 6$ months | Warning or error: "Passport must be valid for at least 6 months from travel date". | High |
| **TC-PASS-07** | Contact details validation | Passenger form | 1. Email: `invalid_email`<br>2. Phone: `123` | Malformed contact | Email format error and Algerian phone length validation triggered. | High |

---

## Module 6: Pricing Summary & Add-ons (PRIC)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PRIC-01** | Price calculation arithmetic check | Checkout summary | 1. Verify: Base Fare + Taxes + Surcharges = Subtotal<br>2. Multiply by passenger count | 2 Adults, 1 Child | Mathematical total matches sum of individual passenger breakdown. | Critical |
| **TC-PRIC-02** | Extra baggage add-on purchase | Add-ons page | 1. Add "+1 Piece (23kg)" for 5,000 DZD<br>2. Check Order Summary | 1 Extra baggage | Total amount updates immediately (+5,000 DZD); itemized in invoice breakdown. | High |
| **TC-PRIC-03** | Seat selection fee calculation | Seat map page | 1. Select Paid seat (e.g. Extra Legroom 2,000 DZD)<br>2. Deselect and choose Free seat | Seat Map | Total updates dynamically upon selection and reverts upon deselection. | High |
| **TC-PRIC-04** | Promo code validation (Valid) | Checkout summary | 1. Enter valid coupon `SUMMER2026`<br>2. Click Apply | Valid code | Discount deducted from total; success banner: "Discount applied: -2,000 DZD". | Medium |
| **TC-PRIC-05** | Promo code validation (Expired/Invalid) | Checkout summary | 1. Enter invalid code `FAKECODE`<br>2. Click Apply | Invalid code | Error: "Invalid or expired promo code"; total price remains unchanged. | Medium |

---

## Module 7: Payment Gateway Processing (PAYM)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-PAYM-01** | Algerian CIB Card payment initiation | User on payment page | 1. Select "Carte CIB"<br>2. Accept Terms & Conditions<br>3. Click "Pay Now" | Local CIB Card | Redirects to SATIM / CIB secure payment gateway portal with correct total amount in DZD. | Critical |
| **TC-PAYM-02** | Edahabia Card payment initiation | User on payment page | 1. Select "Edahabia" (Algérie Poste)<br>2. Click "Pay Now" | Edahabia card | Redirects to Algérie Poste payment page with encrypted transaction reference. | Critical |
| **TC-PAYM-03** | Gateway cancellation & return flow | On gateway portal | 1. Click "Annuler / Cancel" on SATIM payment page | Payment canceled | Returns to Billetix checkout page; message: "Payment canceled. Your booking is held for 15 mins". | High |
| **TC-PAYM-04** | Payment timeout / Session expiration | On gateway portal | 1. Leave OTP input screen idle until timer expires ($> 10$ mins) | OTP Timeout | Gateway rejects transaction; returns to Billetix with clear "Session timed out" message. | High |
| **TC-PAYM-05** | Double-click prevention on "Pay Now" | User on payment page | 1. Rapidly double-click "Pay Now" button | Rapid clicks | Button disables immediately on first click with loading spinner; prevents duplicate charge. | Critical |

---

## Module 8: Order Confirmation, PNR & E-Ticket (TICK)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TICK-01** | Successful booking confirmation page | Payment approved | 1. Complete payment<br>2. Observe redirect | Approved transaction | Redirects to `/booking/confirmation`; displays: Status "CONFIRMED", 6-character PNR (e.g. `BLX78A`), Order ID. | Critical |
| **TC-TICK-02** | PDF E-Ticket download | Confirmation page | 1. Click "Download E-Ticket (PDF)" | Confirmed booking | PDF downloads successfully; file opens cleanly with valid flight timetable, passenger names, and barcodes. | Critical |
| **TC-TICK-03** | Barcode / QR Code readability | E-Ticket document | 1. Scan QR code on E-ticket with scanner | Digital ticket | Encodes passenger name, PNR, and flight number matching booking details. | High |
| **TC-TICK-04** | Automated confirmation email | Confirmed booking | 1. Check inbox of contact email entered | Registered email | Email received within 3 minutes containing booking reference, itinerary, and attached PDF ticket. | High |

---

## Module 9: Manage Booking & Customer Support (MGMT)

| Test Case ID | Test Scenario | Pre-conditions | Test Steps | Test Data | Expected Result | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-MGMT-01** | Retrieve booking by PNR & Last Name | User on homepage | 1. Click "Manage Booking"<br>2. Enter PNR and Passenger Last Name<br>3. Submit | PNR: `BLX78A`<br>Name: "Benali" | Displays full itinerary details, check-in status, and ticket download option. | Critical |
| **TC-MGMT-02** | Invalid PNR retrieval error | "Manage Booking" page | 1. Enter non-existent PNR `ZZZZZZ` | Invalid PNR | Error alert: "No booking found with the provided details. Please verify your PNR." | Medium |
| **TC-MGMT-03** | Support contact details | Footer / Support page | 1. Verify phone: `040529950`<br>2. Verify email: `support@billetix.dz` | Support channels | Phone link triggers dialer; email link opens default mail client with prefilled `to:`. | Medium |
