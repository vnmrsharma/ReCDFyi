/**
 * Public indicator badge component to show when a CD is public
 */

import './CDComponents.css';

interface PublicIndicatorProps {
  viewCount?: number;
  className?: string;
}

/**
 * Badge showing that a CD is publicly visible with optional view count
 */
export function PublicIndicator({ viewCount, className = '' }: PublicIndicatorProps) {
  return (
    <div className={`public-indicator ${className}`}>
      <span className="public-badge">
        🌐 Public
      </span>
      {viewCount !== undefined && viewCount > 0 && (
        <span className="view-count">
          {viewCount} {viewCount === 1 ? 'view' : 'views'}
        </span>
      )}
    </div>
  );
}
