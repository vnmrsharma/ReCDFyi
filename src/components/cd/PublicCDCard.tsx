/**
 * Card component for displaying public CD in marketplace
 */

import type { PublicCD } from '../../types';

interface PublicCDCardProps {
  cd: PublicCD;
  onClick: (cd: PublicCD) => void;
  showPrivateBadge?: boolean;
}

/**
 * Displays a public CD as a card with disc icon, creator info, and metadata
 */
export function PublicCDCard({ cd, onClick, showPrivateBadge = false }: PublicCDCardProps) {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="public-cd-card"
      onClick={() => onClick(cd)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(cd);
        }
      }}
      aria-label={`View public CD: ${cd.name} by @${cd.username}`}
    >
      <div className="public-cd-icon">
        <svg
          viewBox="0 0 100 100"
          className="disc-svg"
          aria-hidden="true"
        >
          {/* Outer disc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#publicDiscGradient)"
            stroke="#333"
            strokeWidth="1"
          />
          {/* Inner hole */}
          <circle cx="50" cy="50" r="10" fill="#fff" stroke="#333" strokeWidth="1" />
          {/* Shine effect */}
          <path
            d="M 50 5 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <defs>
            <radialGradient id="publicDiscGradient">
              <stop offset="0%" stopColor="#9933FF" />
              <stop offset="50%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#00FFFF" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="public-cd-info">
        <div className="cd-name-row">
          <h3 className="public-cd-name">{cd.name}</h3>
          {showPrivateBadge && (
            <span className="private-badge" title="Private CD">🔒</span>
          )}
        </div>
        
        <div className="public-cd-creator">
          <span className="creator-label">by</span>
          <span className="creator-username">@{cd.username}</span>
        </div>

        <div className="public-cd-meta">
          <span className="file-count">
            {cd.fileCount} {cd.fileCount === 1 ? 'file' : 'files'}
          </span>
          <span className="view-count">
            👁 {cd.viewCount} {cd.viewCount === 1 ? 'view' : 'views'}
          </span>
        </div>

        <div className="public-cd-date">
          Shared {formatDate(cd.publicAt)}
        </div>
      </div>
    </div>
  );
}
