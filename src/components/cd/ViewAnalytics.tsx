/**
 * View analytics component for CD owners
 * Displays viewer statistics and list for public CDs
 */

import { useState, useEffect } from 'react';
import { getViewAnalytics } from '../../services/analyticsService';
import { ERROR_MESSAGES } from '../../utils/constants';
import type { ViewAnalytics as ViewAnalyticsType } from '../../types';
import { AnalyticsStats } from './AnalyticsStats';
import { ViewerList } from './ViewerList';
import './CDComponents.css';

interface ViewAnalyticsProps {
  cdId: string;
  isOwner: boolean;
}

/**
 * Displays view analytics for a public CD
 * Only visible to the CD owner
 */
export function ViewAnalytics({ cdId, isOwner }: ViewAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ViewAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) {
      loadAnalytics();
    }
  }, [cdId, isOwner]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getViewAnalytics(cdId);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.message || ERROR_MESSAGES.ANALYTICS_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not owner
  if (!isOwner) {
    return null;
  }

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>View Analytics</h2>
        </div>
        <div className="analytics-loading">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>View Analytics</h2>
        </div>
        <div className="analytics-error" role="alert">
          <p className="error-message">{error}</p>
          <button className="button button-secondary button-small" onClick={loadAnalytics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>View Analytics</h2>
        <span className="analytics-subtitle">Only visible to you</span>
      </div>
      
      <AnalyticsStats
        totalViews={analytics.totalViews}
        uniqueViewers={analytics.uniqueViewers}
      />
      
      <ViewerList viewers={analytics.viewers} />
    </div>
  );
}
