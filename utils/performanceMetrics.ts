import { Page } from '@playwright/test';

/**
 * performanceMetrics.ts — Browser Performance & Core Web Vitals extraction helpers.
 */

export interface NavigationTimingMetrics {
  dnsLookupMs: number;
  tcpConnectMs: number;
  ttfbMs: number; // Time to First Byte (responseStart - requestStart)
  domInteractiveMs: number;
  domContentLoadedMs: number;
  loadEventMs: number;
  transferSizeBytes: number;
}

export interface ResourceSummary {
  totalRequests: number;
  totalSizeBytes: number;
  scriptsSizeBytes: number;
  imagesSizeBytes: number;
  stylesheetsSizeBytes: number;
  slowRequests: Array<{ url: string; durationMs: number }>;
}

/**
 * Extracts Navigation Timing API metrics from the loaded page.
 */
export async function getNavigationTiming(page: Page): Promise<NavigationTimingMetrics> {
  return page.evaluate(() => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length === 0) {
      // Fallback to legacy timing
      const t = performance.timing;
      return {
        dnsLookupMs: Math.max(0, t.domainLookupEnd - t.domainLookupStart),
        tcpConnectMs: Math.max(0, t.connectEnd - t.connectStart),
        ttfbMs: Math.max(0, t.responseStart - t.requestStart),
        domInteractiveMs: Math.max(0, t.domInteractive - t.navigationStart),
        domContentLoadedMs: Math.max(0, t.domContentLoadedEventEnd - t.navigationStart),
        loadEventMs: Math.max(0, t.loadEventEnd - t.navigationStart),
        transferSizeBytes: 0,
      };
    }

    const n = navEntries[0];
    return {
      dnsLookupMs: Math.round(n.domainLookupEnd - n.domainLookupStart),
      tcpConnectMs: Math.round(n.connectEnd - n.connectStart),
      ttfbMs: Math.round(n.responseStart - n.requestStart),
      domInteractiveMs: Math.round(n.domInteractive),
      domContentLoadedMs: Math.round(n.domContentLoadedEventEnd),
      loadEventMs: Math.round(n.loadEventEnd),
      transferSizeBytes: n.transferSize || 0,
    };
  });
}

/**
 * Evaluates First Contentful Paint (FCP) using the Paint Timing API.
 */
export async function getFirstContentfulPaint(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
    return fcp ? Math.round(fcp.startTime) : null;
  });
}

/**
 * Summarizes all loaded resources (scripts, images, stylesheets, total sizes).
 */
export async function getResourceSummary(page: Page, slowThresholdMs: number = 3000): Promise<ResourceSummary> {
  return page.evaluate((slowThreshold) => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    let scriptsSize = 0;
    let imagesSize = 0;
    let stylesSize = 0;
    const slowRequests: Array<{ url: string; durationMs: number }> = [];

    for (const r of resources) {
      const size = r.transferSize || 0;
      totalSize += size;

      if (r.initiatorType === 'script') scriptsSize += size;
      else if (r.initiatorType === 'img' || r.initiatorType === 'image') imagesSize += size;
      else if (r.initiatorType === 'css' || r.initiatorType === 'link') stylesSize += size;

      if (r.duration > slowThreshold) {
        slowRequests.push({ url: r.name, durationMs: Math.round(r.duration) });
      }
    }

    return {
      totalRequests: resources.length,
      totalSizeBytes: totalSize,
      scriptsSizeBytes: scriptsSize,
      imagesSizeBytes: imagesSize,
      stylesheetsSizeBytes: stylesSize,
      slowRequests,
    };
  }, slowThresholdMs);
}
