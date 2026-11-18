/**
 * Sends a page view on each route, including the first load.
 * Uses scrubbed paths and ReCd page titles for readable GA reports.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/analytics';

export function GoogleAnalytics() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const key = `${location.pathname}${location.search}`;
    if (lastPath.current === key) {
      return;
    }
    lastPath.current = key;
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}
