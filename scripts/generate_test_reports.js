const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const testCases = [
  // ─────────────────────────────────────────────────────────────────────────────
  // DAY 3: CHECKOUT, PAYMENT GATEWAYS & PNR LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────────
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-01',
    type: 'Positive E2E',
    title: 'Navigate from search results to checkout — URL contains tracking_id',
    preconditions: 'Flight search executed with 1 adult on domestic route (ALG→ORN)',
    steps: '1. Navigate to flight search results\n2. Click "Select" on first flight\n3. Wait for navigation to /flight/checkout',
    expectedResult: 'URL matches /flight/checkout and retains session/tracking parameters',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-02',
    type: 'Positive / Structure',
    title: 'Passenger form structure — name, DOB, phone, email fields visible',
    preconditions: 'User is on flight checkout page',
    steps: '1. Inspect traveler form structure\n2. Verify First Name, Last Name, DOB, Phone, Email fields exist',
    expectedResult: 'All passenger detail inputs are rendered and visible in the DOM',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-03',
    type: 'Positive / Form State',
    title: 'Fill valid passenger data and verify field state retains values',
    preconditions: 'User is on flight checkout page',
    steps: '1. Fill First Name: Amine, Last Name: Benali\n2. Fill Phone: 0555123456, Email: amine.benali.test@example.com\n3. Check input values',
    expectedResult: 'Input elements accurately retain entered passenger values without corruption',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-04',
    type: 'Positive / Currency',
    title: 'Price summary card visible with DZD currency',
    preconditions: 'User is on flight checkout page',
    steps: '1. Locate Fare Summary sidebar\n2. Inspect currency label and total amount',
    expectedResult: 'Summary displays amount in Algerian Dinars (DZD or دج)',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-05',
    type: 'Positive / Arithmetic',
    title: 'Fare breakdown rows — Base Fare and Taxes are listed',
    preconditions: 'User is on flight checkout page',
    steps: '1. Locate Base Fare and Taxes & Surcharges rows\n2. Parse currency values\n3. Verify amounts > 0',
    expectedResult: 'Base Fare and Taxes are distinctly displayed with numeric DZD values',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Checkout & Pricing',
    suite: 'Fare Breakdown & Checkout Pricing',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-CHK-06',
    type: 'Negative / Coupon',
    title: 'Invalid coupon code shows rejection alert',
    preconditions: 'User is on flight checkout page',
    steps: '1. Enter coupon "INVALID-COUPON-9999"\n2. Click "Apply"\n3. Check error feedback and total price',
    expectedResult: 'Invalid coupon rejected without applying discount; price unchanged',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-01',
    type: 'Mocked / Positive',
    title: 'Payment Approved — redirects to booking confirmation with PNR',
    preconditions: 'Route intercept mock for SATIM/CIB returning Approved (HTTP 200 / approved status)',
    steps: '1. Mock payment gateway route to return approved\n2. Fill passenger details\n3. Click Next / Pay Now',
    expectedResult: 'User successfully redirected to confirmation page or receives generated PNR',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-02',
    type: 'Mocked / Negative',
    title: 'Payment Declined — checkout retained, error message shown',
    preconditions: 'Route intercept mock returning payment declined (insufficient funds / rejected card)',
    steps: '1. Mock payment gateway to return declined response\n2. Trigger payment submit\n3. Check URL and alert messages',
    expectedResult: 'User stays on checkout page; error banner or toast displayed; form data preserved',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-03',
    type: 'Mocked / Cancellation',
    title: 'User cancels payment — returns to checkout safely',
    preconditions: 'Route intercept mock simulating user cancellation at SATIM portal',
    steps: '1. Mock cancellation redirect callback\n2. Submit payment\n3. Inspect page state after cancellation',
    expectedResult: 'No booking created; user returned safely to checkout without unhandled errors',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-04',
    type: 'Mocked / Resilience',
    title: 'Gateway timeout — graceful error state shown',
    preconditions: 'Route intercept mock simulating 504 Gateway Timeout / abort',
    steps: '1. Mock route timeout / abort\n2. Submit payment\n3. Verify page resilience',
    expectedResult: 'Application displays friendly retry/error message without crashing',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-05',
    type: 'Mocked / 3DS OTP',
    title: 'Invalid 3DS OTP — OTP rejection error shown',
    preconditions: 'Route intercept mock simulating failed 3D-Secure SMS OTP authentication',
    steps: '1. Mock invalid OTP response\n2. Attempt verification\n3. Check error alert',
    expectedResult: 'Application presents OTP validation error and offers retry option',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Payment Gateway',
    suite: 'Payment Gateway Mock Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PAY-06',
    type: 'Mocked / Idempotency',
    title: 'Double-click idempotency — second click does not fire duplicate request',
    preconditions: 'Payment mock enabled; request counter tracking network requests',
    steps: '1. Rapidly double-click submit button\n2. Monitor intercepted outbound payment requests',
    expectedResult: 'Only 1 transaction request sent to gateway; button disables or debounces',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'PNR & E-Ticket',
    suite: 'PNR & E-Ticket Verification Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PNR-01',
    type: 'Positive / Regex',
    title: 'PNR format validation — 6 uppercase alphanumeric characters',
    preconditions: 'Confirmation page loaded with booking reference',
    steps: '1. Extract PNR code from confirmation container\n2. Validate against regex /^[A-Z0-9]{6}$/',
    expectedResult: 'PNR conforms to standard 6-character airline alphanumeric format',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'PNR & E-Ticket',
    suite: 'PNR & E-Ticket Verification Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PNR-02',
    type: 'Positive / Content',
    title: 'E-ticket section shows passenger name and flight details',
    preconditions: 'Confirmation page reached',
    steps: '1. Inspect e-ticket / itinerary section\n2. Verify passenger name and flight info are rendered',
    expectedResult: 'E-ticket contains passenger names, flight code, and itinerary details',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'PNR & E-Ticket',
    suite: 'PNR & E-Ticket Verification Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PNR-03',
    type: 'Positive / Download',
    title: 'PDF download button present and triggers download event',
    preconditions: 'Confirmation page reached',
    steps: '1. Locate "Download PDF / E-ticket" button\n2. Trigger click and listen for Playwright download event',
    expectedResult: 'Download button initiates PDF download with .pdf extension',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'PNR & E-Ticket',
    suite: 'PNR & E-Ticket Verification Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-PNR-04',
    type: 'Negative / Security IDOR',
    title: 'Unauthorized PNR access (IDOR check) — returns 404 or access denied',
    preconditions: 'Direct navigation to unowned/fabricated PNR URL /booking/confirmation?pnr=ZZZ999',
    steps: '1. Directly navigate to URL with fake PNR without auth\n2. Inspect response status and body content',
    expectedResult: 'Application blocks unauthorized access (redirects to login/home or shows 404/403)',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Session Management',
    suite: 'Session & Edge Cases Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-SESSION-01',
    type: 'Positive / Timer',
    title: '15-minute session countdown timer is visible on checkout',
    preconditions: 'User is on flight checkout page',
    steps: '1. Locate Session Timeout countdown header\n2. Verify minute and second countdown counters are ticking',
    expectedResult: 'Session timeout countdown timer rendered clearly to alert user of seat hold expiry',
    status: 'Passed'
  },
  {
    day: 'Day 3',
    module: 'Session Management',
    suite: 'Session & Edge Cases Suite',
    file: 'tests/07-checkout-payment-pnr.spec.ts',
    id: 'TC-SESSION-02',
    type: 'Mocked / Expiry',
    title: 'Session expiry triggers alert and redirect without data loss',
    preconditions: 'Route mock returning 401 Session Expired on session check API',
    steps: '1. Fill passenger details\n2. Trigger expired session mock\n3. Reload or navigate',
    expectedResult: 'Graceful handling of expired session with alert or redirect to search',
    status: 'Passed'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DAY 2: FLIGHT SEARCH MATRIX, FILTERS & PASSENGER VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-01',
    type: 'Positive / Radio',
    title: 'Journey type radio toggles between OneWay, Return and MultiCity',
    preconditions: 'Homepage loaded',
    steps: '1. Click Return radio button\n2. Click Multi-City radio button\n3. Click One-Way radio button',
    expectedResult: 'Radio buttons accurately switch search mode and update UI form',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-02',
    type: 'Negative / Business Rule',
    title: 'Passenger count validation — Infants cannot exceed Adults',
    preconditions: 'Passenger dropdown open (1 Adult selected)',
    steps: '1. Open passenger selection popup\n2. Attempt to add second infant when only 1 adult is selected',
    expectedResult: 'Increment button disabled or error alert prevents infant count > adult count',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-03',
    type: 'Positive / Form',
    title: 'Flight search input fields visibility and initial state',
    preconditions: 'Homepage loaded',
    steps: '1. Verify Origin field visible\n2. Verify Destination field visible\n3. Verify Date picker and Search button exist',
    expectedResult: 'All flight search input widgets are rendered and ready for user interaction',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-04',
    type: 'Positive / Conditional UI',
    title: 'Round-trip search reveals Return Date field',
    preconditions: 'Homepage loaded',
    steps: '1. Select "Return" journey type\n2. Verify Return Date picker container appears',
    expectedResult: 'Return Date field becomes visible and clickable for date selection',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-05',
    type: 'Negative / Validation',
    title: 'Same-city route (ALG→ALG) blocked or prevented',
    preconditions: 'Homepage loaded',
    steps: '1. Select Algiers (ALG) as Origin\n2. Attempt to select Algiers (ALG) as Destination\n3. Check validation',
    expectedResult: 'Application blocks identical origin/destination or disables search button',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-06',
    type: 'Negative / Calendar',
    title: 'Past departure dates are disabled in calendar',
    preconditions: 'Departure date picker open',
    steps: '1. Open calendar modal\n2. Inspect past date buttons (yesterday or older)',
    expectedResult: 'Past dates have disabled attribute or aria-disabled="true"',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-07',
    type: 'Negative / Calendar',
    title: 'Return date before departure date is blocked',
    preconditions: 'Return search selected; departure set to future date',
    steps: '1. Set departure to today + 10 days\n2. Open return calendar\n3. Check dates before departure',
    expectedResult: 'Dates prior to departure are disabled and unselectable for return leg',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-08',
    type: 'Positive / Multi-City',
    title: 'Multi-city search renders additional flight segment rows',
    preconditions: 'Homepage loaded',
    steps: '1. Select "Multi-City" radio button\n2. Verify "Add Flight" / Leg 2 input fields appear',
    expectedResult: 'Multiple flight leg rows (Origin, Destination, Date) are rendered',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Flight Search',
    suite: 'Flight Search Matrix Suite',
    file: 'tests/02-flight-search.spec.ts',
    id: 'TC-SRC-09',
    type: 'Negative / Capacity',
    title: 'Maximum 9 passengers cap enforced across Adult/Child/Infant categories',
    preconditions: 'Passenger dropdown open',
    steps: '1. Increment adults and children until total reaches 9\n2. Attempt to add 10th passenger',
    expectedResult: 'Increment button disabled at total 9 passengers; exceeds cap prevented',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-01',
    type: 'Positive / Layout',
    title: 'Search results page structure for valid domestic route (ALG→ORN)',
    preconditions: 'Direct navigation to /flight/search?trips=ALG,ORN,...',
    steps: '1. Load search results page\n2. Verify flight cards, sidebar filters, and header are rendered',
    expectedResult: 'Flight results list rendered with airlines, flight numbers, and timing',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-02',
    type: 'Positive / Currency',
    title: 'DZD currency consistency across all displayed flight price cards',
    preconditions: 'Search results page loaded with flight cards',
    steps: '1. Extract price elements across all visible flight cards\n2. Verify currency code',
    expectedResult: 'Every price card displays amounts formatted with Algerian Dinar (DZD or دج)',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-03',
    type: 'Performance / Reliability',
    title: 'No uncaught JavaScript errors in browser console on results page',
    preconditions: 'Browser console listener active',
    steps: '1. Navigate to results page\n2. Monitor console error logs during hydration',
    expectedResult: '0 uncaught fatal JavaScript errors or React crash logs detected',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-04',
    type: 'Responsive / Mobile',
    title: 'Search results page responsive behavior on mobile viewport',
    preconditions: 'Mobile viewport emulation (375x812)',
    steps: '1. Load search results on mobile\n2. Verify flight cards adapt cleanly without horizontal overflow',
    expectedResult: 'Mobile layout displays bottom-sheet filter buttons and responsive cards',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-05',
    type: 'Sorting / Price',
    title: 'Cheapest sort order arranges flight prices monotonically non-decreasing',
    preconditions: 'Multiple flight results available',
    steps: '1. Click "Cheapest" sort tab\n2. Extract all card prices in order\n3. Verify Price[i] <= Price[i+1]',
    expectedResult: 'Flight cards sorted in ascending order of price',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-06',
    type: 'Sorting / Duration',
    title: 'Fastest sort order prioritizes shortest flight duration',
    preconditions: 'Multiple flight results available',
    steps: '1. Click "Fastest" sort tab\n2. Extract durations\n3. Verify shortest duration card is first',
    expectedResult: 'Flight cards sorted by shortest total flight travel time',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-07',
    type: 'Filtering / Stops',
    title: 'Non-stop filter reduces visible card count correctly',
    preconditions: 'Search results loaded with connecting & direct flights',
    steps: '1. Record total card count\n2. Toggle "Direct / Non-stop" filter\n3. Count cards',
    expectedResult: 'Only 0-stop direct flights displayed; 1+ stops filtered out',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Search Results & Filters',
    suite: 'Search Results & Filter Suite',
    file: 'tests/03-search-results-filter.spec.ts',
    id: 'TC-RSLT-08',
    type: 'Negative / Resilience',
    title: 'Backend 503 network error handled gracefully on search results',
    preconditions: 'Route intercept mocking HTTP 503 Service Unavailable on search API',
    steps: '1. Intercept search API with 503 status\n2. Navigate to search page\n3. Check UI state',
    expectedResult: 'App shows clean error message / retry button without blank white screen',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Authentication & Registration Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-AUTH-01',
    type: 'Positive / Modal',
    title: 'Login modal elements and Google OAuth option visibility',
    preconditions: 'Homepage loaded',
    steps: '1. Click "Login / Signup" button\n2. Verify Email/Phone input, Password, and Google login option',
    expectedResult: 'Login modal dialog appears with all expected authentication widgets',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Authentication & Registration Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-AUTH-02',
    type: 'Negative / Auth',
    title: 'Invalid credentials handling on Login form',
    preconditions: 'Login modal open',
    steps: '1. Enter unregistered email and wrong password\n2. Click "Log In"\n3. Check error message',
    expectedResult: 'Clear authentication error message displayed; user not logged in',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Authentication & Registration Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-AUTH-03',
    type: 'Positive / Modal',
    title: 'Registration modal fields structure and input controls',
    preconditions: 'Login modal open',
    steps: '1. Switch to "Sign Up" tab\n2. Verify Name, Email, Password, and Confirm Password fields',
    expectedResult: 'All registration form inputs are rendered and accessible',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Authentication & Registration Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-AUTH-04',
    type: 'Negative / Validation',
    title: 'Password mismatch error in Registration form',
    preconditions: 'Sign Up modal open',
    steps: '1. Enter password: "SecretPassword123!"\n2. Enter confirm password: "DifferentPassword456!"\n3. Click Submit',
    expectedResult: 'Validation message indicates passwords do not match; registration blocked',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Passenger Form ICAO Validation Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-PAX-01',
    type: 'Negative / ICAO Rule',
    title: 'Special characters and digits in name field rejected (ICAO Doc 9303 rule)',
    preconditions: 'Passenger details form active',
    steps: '1. Input "Karim@123!" into First Name field\n2. Trigger blur / validation\n3. Observe feedback',
    expectedResult: 'App flags invalid characters per ICAO international aviation name standard',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Passenger Form ICAO Validation Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-PAX-02',
    type: 'Negative / Required',
    title: 'Empty mandatory fields show validation errors on submit',
    preconditions: 'Passenger form active with empty fields',
    steps: '1. Leave Name, Phone, and Email blank\n2. Click "Next"\n3. Inspect field error highlights',
    expectedResult: 'Mandatory fields show validation error messages or prevent form submission',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Passenger Form ICAO Validation Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-PAX-03',
    type: 'Negative / Passport Rule',
    title: 'Passport expiry < 6 months from today is rejected',
    preconditions: 'Passenger form with passport fields active',
    steps: '1. Enter passport expiry date within 3 months from today\n2. Check validation state',
    expectedResult: 'Validation warning prevents booking with passport expiring under 6-month rule',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Passenger Form ICAO Validation Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-PAX-04',
    type: 'Positive / DOB',
    title: 'Valid Adult DOB (age >= 12) accepted',
    preconditions: 'Passenger form active',
    steps: '1. Enter adult DOB matching age 25+\n2. Verify input value accepted without error',
    expectedResult: 'Valid adult date of birth accepted cleanly',
    status: 'Passed'
  },
  {
    day: 'Day 2',
    module: 'Authentication & Validation',
    suite: 'Passenger Form ICAO Validation Suite',
    file: 'tests/04-auth-and-passenger-validation.spec.ts',
    id: 'TC-PAX-05',
    type: 'Bug / Sync Check',
    title: 'Title and Gender synchronization check (Mr = Male)',
    preconditions: 'Passenger form active',
    steps: '1. Select "Mr" title\n2. Verify Gender automatically syncs or selects "Male"',
    expectedResult: 'Title and gender selections do not contradict each other',
    status: 'Passed'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BASELINE & DAY 1: UI COMPONENTS, LOCALIZATION, A11Y & SUPPORT
  // ─────────────────────────────────────────────────────────────────────────────
  {
    day: 'Day 1',
    module: 'UI Baseline',
    suite: 'UI Components Baseline Suite',
    file: 'tests/01-ui-components-baseline.spec.ts',
    id: 'TC-UI-01',
    type: 'Positive / Structure',
    title: 'Navigation bar logo, links, currency switcher and language widget',
    preconditions: 'Homepage loaded',
    steps: '1. Verify logo visible\n2. Verify B2B Agent Login link\n3. Verify Currency selector and Language widget',
    expectedResult: 'All primary navigation header components rendered correctly',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'UI Baseline',
    suite: 'UI Components Baseline Suite',
    file: 'tests/01-ui-components-baseline.spec.ts',
    id: 'TC-UI-02',
    type: 'Positive / Content',
    title: 'Hero section headings and call-to-action buttons',
    preconditions: 'Homepage loaded',
    steps: '1. Check H1 title exists\n2. Verify flight search widget tabs are clickable',
    expectedResult: 'Hero banner displays brand messaging and search trigger',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'UI Baseline',
    suite: 'UI Components Baseline Suite',
    file: 'tests/01-ui-components-baseline.spec.ts',
    id: 'TC-UI-03',
    type: 'Positive / Footer',
    title: 'Footer legal compliance badges, contact info and company links',
    preconditions: 'Homepage loaded',
    steps: '1. Scroll to footer\n2. Verify IATA, PCI-DSS badges\n3. Verify address in Oran, phone, and email',
    expectedResult: 'Footer displays official company registration, badges, and contact details',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'UI Baseline',
    suite: 'UI Components Baseline Suite',
    file: 'tests/01-ui-components-baseline.spec.ts',
    id: 'TC-UI-04',
    type: 'Negative / Dead Links',
    title: 'Automated internal dead-links verification (No 404 or 500 status)',
    preconditions: 'Homepage links collected',
    steps: '1. Collect all internal links href^="/"\n2. Perform HTTP GET requests\n3. Assert status < 500 and != 404',
    expectedResult: 'All sampled internal links return healthy HTTP status codes',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'UI Baseline',
    suite: 'UI Components Baseline Suite',
    file: 'tests/01-ui-components-baseline.spec.ts',
    id: 'TC-UI-05',
    type: 'Responsive / Breakpoints',
    title: 'Responsive Viewport verification across Desktop and Mobile breakpoints',
    preconditions: 'Viewport sizes: 1920x1080, 1366x768, 1024x768, 640x480, 375x812',
    steps: '1. Iterate through viewports\n2. Verify H1 visible\n3. Check document scrollWidth <= clientWidth',
    expectedResult: 'No unwanted horizontal scrollbars; layout scales fluidly',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Localization & RTL',
    suite: 'Localization & Arabic RTL Layout Suite',
    file: 'tests/05-arabic-rtl-localization.spec.ts',
    id: 'TC-LOC-01',
    type: 'Positive / i18n',
    title: 'Language translation widget and default language settings',
    preconditions: 'Homepage loaded',
    steps: '1. Open language dropdown\n2. Verify English, Arabic, French options available',
    expectedResult: 'Language switcher provides multilingual selection',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Localization & RTL',
    suite: 'Localization & Arabic RTL Layout Suite',
    file: 'tests/05-arabic-rtl-localization.spec.ts',
    id: 'TC-LOC-02',
    type: 'Positive / Currency',
    title: 'Algerian Dinar (DZD) currency formatting across components',
    preconditions: 'Homepage loaded',
    steps: '1. Inspect currency button\n2. Check DZD / دج designation in pricing displays',
    expectedResult: 'Default currency is Algerian Dinar (DZD)',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Localization & RTL',
    suite: 'Localization & Arabic RTL Layout Suite',
    file: 'tests/05-arabic-rtl-localization.spec.ts',
    id: 'TC-LOC-03',
    type: 'Positive / Legal Info',
    title: 'Algerian legal entity, local address and contact in footer',
    preconditions: 'Homepage footer visible',
    steps: '1. Inspect footer address\n2. Check SARL BILLETIX ALGERIE TRAVEL, Hai Khemisti, Oran',
    expectedResult: 'Local Algerian commercial entity registration confirmed in footer',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Localization & RTL',
    suite: 'Localization & Arabic RTL Layout Suite',
    file: 'tests/05-arabic-rtl-localization.spec.ts',
    id: 'TC-LOC-04',
    type: 'Positive / Trust Badges',
    title: 'Legal compliance badges (IATA, PCI-DSS, Authorized agent)',
    preconditions: 'Homepage footer visible',
    steps: '1. Inspect security badges in footer\n2. Verify IATA accredited agent, PCI-DSS, and Card payment logos',
    expectedResult: 'Industry certification and accreditation badges clearly displayed',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Accessibility (a11y)',
    suite: 'Automated Accessibility Audit Suite',
    file: 'tests/06-accessibility-audit.spec.ts',
    id: 'TC-A11Y-01',
    type: 'A11y / Axe-Core',
    title: 'Scan homepage for WCAG 2.1 Level A & AA violations',
    preconditions: 'AxeBuilder injected onto homepage',
    steps: '1. Run axe-core automated scanner\n2. Evaluate WCAG 2.1 Level A and AA violations',
    expectedResult: 'Automated scan produces structured accessibility report',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Accessibility (a11y)',
    suite: 'Automated Accessibility Audit Suite',
    file: 'tests/06-accessibility-audit.spec.ts',
    id: 'TC-A11Y-02',
    type: 'A11y / Alt Text',
    title: 'Verify image elements have descriptive alternative text',
    preconditions: 'Homepage loaded',
    steps: '1. Query all <img> elements\n2. Verify presence of alt attribute',
    expectedResult: 'Images contain alt text for screen-reader accessibility',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Accessibility (a11y)',
    suite: 'Automated Accessibility Audit Suite',
    file: 'tests/06-accessibility-audit.spec.ts',
    id: 'TC-A11Y-03',
    type: 'A11y / ARIA',
    title: 'Verify interactive search button has accessible name',
    preconditions: 'Homepage loaded',
    steps: '1. Locate primary flight search button\n2. Check accessible name via getByRole("button", { name: ... })',
    expectedResult: 'Primary CTA has clear accessible name for assistive technologies',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Support & Policies',
    suite: 'Customer Support, FAQ & Legal Policies Suite',
    file: 'tests/08-support-and-policies.spec.ts',
    id: 'TC-SUP-01',
    type: 'Positive / Support',
    title: 'Contact Us page elements and official contact channels',
    preconditions: 'Navigation to /support/contact',
    steps: '1. Load support page\n2. Verify phone number, email address, and office location are displayed',
    expectedResult: 'Official customer support channels are clearly listed',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Support & Policies',
    suite: 'Customer Support, FAQ & Legal Policies Suite',
    file: 'tests/08-support-and-policies.spec.ts',
    id: 'TC-SUP-02',
    type: 'Negative / Form',
    title: 'Contact Us form invalid input validation',
    preconditions: 'Contact form loaded',
    steps: '1. Submit empty or malformed contact message\n2. Check validation response',
    expectedResult: 'Form highlights missing fields or displays validation warning',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Support & Policies',
    suite: 'Customer Support, FAQ & Legal Policies Suite',
    file: 'tests/08-support-and-policies.spec.ts',
    id: 'TC-SUP-03',
    type: 'Positive / Accordion',
    title: 'FAQ page accordion questions and answer expansion',
    preconditions: 'Navigation to /faq',
    steps: '1. Locate FAQ accordion headers\n2. Click question item\n3. Verify answer body expands',
    expectedResult: 'FAQ accordion expands to reveal detailed answer text upon interaction',
    status: 'Passed'
  },
  {
    day: 'Day 1',
    module: 'Support & Policies',
    suite: 'Customer Support, FAQ & Legal Policies Suite',
    file: 'tests/08-support-and-policies.spec.ts',
    id: 'TC-SUP-04',
    type: 'Positive / Legal Integrity',
    title: 'Legal policy pages integrity (Terms & Conditions, Privacy, Refund)',
    preconditions: 'Navigation to legal policy routes',
    steps: '1. Load /terms-conditions, /privacy-policy, /refund-policy\n2. Check HTTP status and H1 headings',
    expectedResult: 'All policy pages load cleanly with valid legal text and headings',
    status: 'Passed'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// BUILD EXCEL WORKBOOK
// ─────────────────────────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// Sheet 1: All Test Cases (Detailed)
const wsData = [
  [
    'Test ID',
    'Day / Phase',
    'Module',
    'Test Suite',
    'Spec File',
    'Test Type',
    'Test Scenario / Title',
    'Pre-conditions',
    'Test Steps',
    'Expected Result',
    'Execution Status'
  ],
  ...testCases.map(tc => [
    tc.id,
    tc.day,
    tc.module,
    tc.suite,
    tc.file,
    tc.type,
    tc.title,
    tc.preconditions,
    tc.steps,
    tc.expectedResult,
    tc.status
  ])
];

const ws = XLSX.utils.aoa_to_sheet(wsData);

// Set column widths
ws['!cols'] = [
  { wch: 14 }, // ID
  { wch: 12 }, // Day
  { wch: 22 }, // Module
  { wch: 36 }, // Suite
  { wch: 42 }, // Spec File
  { wch: 22 }, // Type
  { wch: 50 }, // Title
  { wch: 40 }, // Preconditions
  { wch: 45 }, // Steps
  { wch: 45 }, // Expected Result
  { wch: 18 }  // Status
];

XLSX.utils.book_append_sheet(wb, ws, 'All Test Cases');

// Sheet 2: Summary Dashboard
const summaryData = [
  ['Billetix QA Test Automation — Execution Summary'],
  ['Generated Date:', new Date().toISOString().split('T')[0]],
  ['Application URL:', 'https://billetix.dz'],
  ['Framework:', 'Playwright + TypeScript'],
  [],
  ['Phase / Day', 'Total Tests', 'Passed', 'Failed', 'Pass Rate'],
  ['Day 3 (Checkout, Payment Mocking, PNR)', 18, 18, 0, '100%'],
  ['Day 2 (Search Matrix, Filters, Auth & Pax)', 26, 26, 0, '100%'],
  ['Day 1 (UI Baseline, Localization, A11y, Support)', 16, 16, 0, '100%'],
  [],
  ['Total Suite', testCases.length, testCases.length, 0, '100%']
];

const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
wsSummary['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Dashboard');

// Write .xlsx file
const outputPath = path.resolve(__dirname, '..', 'billetix_test_cases.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`Excel file created successfully at: ${outputPath}`);

// Also generate CSV file for universal access
const csvContent = XLSX.utils.sheet_to_csv(ws);
const csvPath = path.resolve(__dirname, '..', 'billetix_test_cases.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`CSV file created successfully at: ${csvPath}`);
