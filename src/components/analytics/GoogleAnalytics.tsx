/**
 * Sends a page view on each route, including the first load.
 * The gtag snippet in index.html loads the tag without an automatic
 * page view, so share-link tokens are not sent to Google.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = 'G-N3692B6XMY';

function analyticsPath(pathname: string, search: string): string {
  // Do not send share-token secrets to Google Analytics
  const path = pathname.replace(/^\/shared\/[^/]+/, '/shared/:token');
  return path + search;
}

export function GoogleAnalytics() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = analyticsPath(location.pathname, location.search);
    if (lastPath.current === pagePath) {
      return;
    }
    lastPath.current = pagePath;

    const gtag = window.gtag;
    if (typeof gtag !== 'function') {
      return;
    }

    gtag('event', 'page_view', {
      send_to: MEASUREMENT_ID,
      page_path: pagePath,
      page_location: `${window.location.origin}${pagePath}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
