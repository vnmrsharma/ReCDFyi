/**
 * ShareModal component
 * Modal dialog for sharing CDs via email or link
 */

import { useState, useEffect } from 'react';
import { ShareLinkDisplay } from './ShareLinkDisplay';
import { EmailShareForm } from './EmailShareForm';
import { generateShareToken } from '../../services/shareService';
import type { CD } from '../../types';
import './ShareComponents.css';

interface ShareModalProps {
  cd: CD;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (recipientEmail: string, shareUrl: string, customMessage?: string) => Promise<void>;
  onCopyLink?: () => void;
}

type TabType = 'link' | 'email';

export function ShareModal({
  cd,
  userId,
  isOpen,
  onClose,
  onSendEmail,
  onCopyLink,
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareLink();
    }
  }, [isOpen]);

  const generateShareLink = async () => {
    setLoading(true);
    setError('');
    
    try {
      const shareToken = await generateShareToken(cd.id, userId);
      const url = `${window.location.origin}/shared/${shareToken.token}`;
      setShareUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (recipientEmail: string, customMessage?: string) => {
    await onSendEmail(recipientEmail, shareUrl, customMessage);
  };

  const handleCopyLink = () => {
    onCopyLink?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Share CD: {cd.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <p>Generating share link...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
              <button className="retry-button" onClick={generateShareLink}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && shareUrl && (
            <>
              <div className="tab-container">
                <button
                  className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
                  onClick={() => setActiveTab('link')}
                >
                  Copy Link
                </button>
                <button
                  className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
                  onClick={() => setActiveTab('email')}
                >
                  Send Email
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'link' && (
                  <ShareLinkDisplay shareUrl={shareUrl} onCopy={handleCopyLink} />
                )}
                {activeTab === 'email' && (
                  <EmailShareForm cdName={cd.name} onSendEmail={handleSendEmail} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
