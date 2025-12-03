/**
 * ShareLinkDisplay component
 * Displays a share link with copy-to-clipboard functionality
 */

import { useState } from 'react';
import './ShareComponents.css';

interface ShareLinkDisplayProps {
  shareUrl: string;
  onCopy?: () => void;
}

export function ShareLinkDisplay({ shareUrl, onCopy }: ShareLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onCopy?.();
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="share-link-display">
      <label className="share-link-label">Share Link</label>
      <div className="share-link-container">
        <input
          type="text"
          className="share-link-input"
          value={shareUrl}
          readOnly
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          className="copy-button retro-button"
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="share-link-info">Link expires in 30 days</p>
    </div>
  );
}
