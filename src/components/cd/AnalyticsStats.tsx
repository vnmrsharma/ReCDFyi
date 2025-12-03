/**
 * Analytics stats summary component
 * Displays total views and unique viewers count
 */

import './CDComponents.css';

interface AnalyticsStatsProps {
  totalViews: number;
  uniqueViewers: number;
}

/**
 * Displays summary statistics for CD view analytics
 */
export function AnalyticsStats({ totalViews, uniqueViewers }: AnalyticsStatsProps) {
  return (
    <div className="analytics-stats">
      <div className="stat-card">
        <div className="stat-icon">👁️</div>
        <div className="stat-content">
          <div className="stat-value">{totalViews}</div>
          <div className="stat-label">
            {totalViews === 1 ? 'Total View' : 'Total Views'}
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">👤</div>
        <div className="stat-content">
          <div className="stat-value">{uniqueViewers}</div>
          <div className="stat-label">
            {uniqueViewers === 1 ? 'Unique Viewer' : 'Unique Viewers'}
          </div>
        </div>
      </div>
    </div>
  );
}
