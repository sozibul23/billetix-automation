import http from 'k6/http';
import { check, sleep } from 'k6';
// @ts-ignore
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Warm-up to 50 VUs
    { duration: '10m', target: 50 },  // Soak test: sustain 50 VUs for 10 minutes
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    // 95% of requests must complete below 2500ms
    http_req_duration: ['p(95)<2500'],
    // HTTP failure rate must stay below 0.5% during long-run soak
    http_req_failed: ['rate<0.005'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://billetix.dz';

export default function () {
  const res = http.get(`${BASE_URL}/`, {
    tags: { name: 'Soak_Homepage' },
  });
  check(res, {
    'Status 200': (r) => r.status === 200,
    'Response time < 2500ms': (r) => r.timings.duration < 2500,
  });

  sleep(3);
}

export function handleSummary(data) {
  return {
    'perf/soak-test-report.html': htmlReport(data),
  };
}
