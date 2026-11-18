/**
 * Google Analytics helpers for ReCd(fyi)
 * - Keeps share tokens / IDs out of page paths
 * - Sends product events that show up in GA4 Reports → Engagement → Events
 */

export const GA_MEASUREMENT_ID = 'G-N3692B6XMY';

export type AnalyticsEventName =
  | 'cd_create'
  | 'file_upload'
  | 'share_link_create'
  | 'share_link_copy'
  | 'share_email_send'
  | 'cd_public_toggle'
  | 'signup'
  | 'login';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Scrub sensitive or high-cardinality path segments before sending to GA
 */
export function sanitizeAnalyticsPath(pathname: string, search: string = ''): string {
  let path = pathname;

  path = path.replace(/^\/shared\/[^/]+/, '/shared/:token');
  path = path.replace(/^\/cd\/[^/]+/, '/cd/:cdId');
  path = path.replace(/^\/marketplace\/[^/]+/, '/marketplace/:cdId');
  path = path.replace(/^\/profile\/[^/]+/, '/profile/:username');

  // Keep UTM / campaign params; drop nothing else for now
  return path + search;
}

/**
 * Human page titles for GA content reports (instead of "kiroween" everywhere)
 */
export function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'ReCd(fyi) — Home';
  if (pathname === '/auth') return 'ReCd(fyi) — Sign in';
  if (pathname === '/collection') return 'ReCd(fyi) — My Collection';
  if (pathname.startsWith('/cd/')) return 'ReCd(fyi) — CD Detail';
  if (pathname === '/settings') return 'ReCd(fyi) — Settings';
  if (pathname === '/marketplace') return 'ReCd(fyi) — Marketplace';
  if (pathname.startsWith('/marketplace/')) return 'ReCd(fyi) — Public CD';
  if (pathname.startsWith('/shared/')) return 'ReCd(fyi) — Shared CD';
  if (pathname.startsWith('/profile/')) return 'ReCd(fyi) — Creator Profile';
  if (pathname === '/about') return 'ReCd(fyi) — About';
  if (pathname === '/help') return 'ReCd(fyi) — Help';
  if (pathname === '/privacy') return 'ReCd(fyi) — Privacy';
  if (pathname === '/terms') return 'ReCd(fyi) — Terms';
  return 'ReCd(fyi)';
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params: Record<string, string | number | boolean | undefined> = {}
): void {
  const gtag = window.gtag;
  if (typeof gtag !== 'function') {
    return;
  }

  // Drop undefined values so GA does not get noisy nullish params
  const cleaned: Record<string, string | number | boolean> = {
    send_to: GA_MEASUREMENT_ID,
  };
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }

  gtag('event', eventName, cleaned);
}

export function trackPageView(pathname: string, search: string = ''): void {
  const gtag = window.gtag;
  if (typeof gtag !== 'function') {
    return;
  }

  const pagePath = sanitizeAnalyticsPath(pathname, search);
  const pageTitle = getPageTitle(pathname);
  document.title = pageTitle;

  gtag('event', 'page_view', {
    send_to: GA_MEASUREMENT_ID,
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: pageTitle,
  });
}
