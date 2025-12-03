/**
 * Viewer list component
 * Displays list of users who have viewed a public CD
 */

import { Link } from 'react-router-dom';
import type { ViewRecord } from '../../types';
import './CDComponents.css';

interface ViewerListProps {
  viewers: ViewRecord[];
}

/**
 * Displays a list of viewers with usernames and timestamps
 */
export function ViewerList({ viewers }: ViewerListProps) {
  if (viewers.length === 0) {
    return (
      <div className="viewer-list-container">
        <div className="viewer-list-header">
          <h3>Recent Viewers</h3>
        </div>
        <div className="viewer-list-empty">
          <p>No views yet. Share your CD to get viewers!</p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="viewer-list-container">
      <div className="viewer-list-header">
        <h3>Recent Viewers</h3>
        <span className="viewer-count">{viewers.length} shown</span>
      </div>
      
      <div className="viewer-list">
        {viewers.map((viewer, index) => (
          <div key={`${viewer.username}-${index}`} className="viewer-item">
            <div className="viewer-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            
            <div className="viewer-info">
              <Link to={`/profile/${viewer.username}`} className="viewer-username">
                @{viewer.username}
              </Link>
              <span className="viewer-timestamp">
                {formatTimestamp(viewer.viewedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
