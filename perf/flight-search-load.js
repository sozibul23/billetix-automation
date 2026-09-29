import http from 'k6/http';
import { check, sleep } from 'k6';
// @ts-ignore
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up to 50 VUs
    { duration: '1m', target: 200 },   // Normal load at 200 VUs
    { duration: '30s', target: 300 },  // Spike peak at 300 VUs
    { duration: '30s', target: 0 },    // Ramp-down to 0 VUs
  ],
  thresholds: {
    // 95% of requests must complete below 2500ms
    http_req_duration: ['p(95)<2500'],
    // HTTP failure rate must stay below 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://billetix.dz';

export default function () {
  // 1. Visit Homepage
  const resHome = http.get(`${BASE_URL}/`, {
    tags: { name: '01_Homepage' },
  });
  check(resHome, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // 2. Flight Search Endpoint (One-Way ALG -> ORN)
  const searchUrl = `${BASE_URL}/flight/search?trips=ALG,ORN,2026-10-15&journey_type=OneWay&adults=1`;
  const resSearch = http.get(searchUrl, {
    tags: { name: '02_FlightSearch' },
  });
  check(resSearch, {
    'Search page status is 200': (r) => r.status === 200,
    'Search response time < 3500ms': (r) => r.timings.duration < 3500,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'perf/flight-search-report.html': htmlReport(data),
    stdout: JSON.stringify(data, null, 2),
  };
}
