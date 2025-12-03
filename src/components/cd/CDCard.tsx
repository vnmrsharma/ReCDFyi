/**
 * Card component for displaying individual CD information
 */

import React from 'react';
import type { CD } from '../../types';

interface CDCardProps {
  cd: CD;
  onClick: (cd: CD) => void;
}

/**
 * Displays a CD as a card with disc icon and metadata
 */
export function CDCard({ cd, onClick }: CDCardProps) {
  const usedMB = (cd.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = (cd.storageLimitBytes / (1024 * 1024)).toFixed(0);
  const usagePercentage = (cd.storageUsedBytes / cd.storageLimitBytes) * 100;
  
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      className="cd-card"
      onClick={() => onClick(cd)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(cd);
        }
      }}
      aria-label={`Open CD: ${cd.name}`}
    >
      <div className="cd-icon">
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
            fill="url(#discGradient)"
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
            <radialGradient id="discGradient">
              <stop offset="0%" stopColor="#9933FF" />
              <stop offset="50%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#00FFFF" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="cd-info">
        <h3 className="cd-name">{cd.name}</h3>
        {cd.label && <p className="cd-label">{cd.label}</p>}
        
        <div className="storage-info">
          <div className="storage-bar">
            <div
              className="storage-bar-fill"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="storage-text">
            {usedMB} MB / {limitMB} MB
          </p>
        </div>

        <div className="cd-meta">
          <span className="file-count">
            {cd.fileCount} {cd.fileCount === 1 ? 'file' : 'files'}
          </span>
          <span className="created-date">{formatDate(cd.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
