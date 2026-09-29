/**
 * securityPayloads.ts — Curated non-destructive OWASP security test payloads
 * for automated input fuzzing and boundary testing on Billetix.
 */

export const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR '1'='1' --",
  "1' ORDER BY 1--+",
  "'; DROP TABLE test_dummy; --",
  "' UNION SELECT null, null--",
];

export const XSS_PAYLOADS = [
  "<script>window.__xss_detected=true;</script>",
  "<img src=x onerror=\"window.__xss_detected=true;\">",
  "<svg/onload=\"window.__xss_detected=true;\">",
  "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*///0/alert(1)//'>",
  "\"><script>window.__xss_detected=true;</script>",
];

export const PATH_TRAVERSAL_PAYLOADS = [
  "../../../../etc/passwd",
  "..\\..\\..\\windows\\win.ini",
  "%2e%2e%2f%2e%2e%2f",
];

export const OPEN_REDIRECT_PAYLOADS = [
  "https://evil-phishing-example.com",
  "//evil-phishing-example.com",
  "javascript:window.location='https://evil-phishing-example.com'",
];
