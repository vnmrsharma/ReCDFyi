/**
 * SharedCDView component for recipients accessing shared CDs
 * Provides guest access without authentication
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileList } from '../cd/FileList';
import { FilePreviewModal } from '../preview/FilePreviewModal';
import { GuestPromptModal } from './GuestPromptModal';
import { EmptyState } from '../ui/EmptyState';
import { EmptyDiscIcon } from '../ui/EmptyDiscIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getSharedCD, getSharedCDFiles } from '../../services/shareService';
import { ERROR_MESSAGES } from '../../utils/constants';
import type { CD, MediaFile } from '../../types';
import './ShareComponents.css';

/**
 * Displays a shared CD for recipients with guest access
 */
export function SharedCDView() {
  const { token } = useParams<{ token: string }>();
  
  const [cd, setCD] = useState<CD | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [showGuestPrompt, setShowGuestPrompt] = useState(true);
  const [hasAcceptedGuest, setHasAcceptedGuest] = useState(false);

  useEffect(() => {
    // Check if user has already accepted guest access in this session
    const guestAccepted = sessionStorage.getItem(`guest_accepted_${token}`);
    if (guestAccepted === 'true') {
      setShowGuestPrompt(false);
      setHasAcceptedGuest(true);
      loadSharedCD();
    }
  }, [token]);

  const loadSharedCD = async () => {
    if (!token) {
      setError('Share token is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate token and get CD
      const cdData = await getSharedCD(token);
      setCD(cdData);
      
      // Get files for the CD using the share token
      const filesData = await getSharedCDFiles(cdData.id, token);
      setFiles(filesData);
      
      // For now, we'll show the user ID as owner info
      // In a real app, you might want to fetch user details from Firestore
      setOwnerEmail(cdData.userId);
    } catch (err: any) {
      // Map error to user-friendly message
      const errorMessage = err.message || 'Failed to load shared CD';
      
      if (errorMessage.includes('invalid') || errorMessage.includes('revoked')) {
        setError(ERROR_MESSAGES.SHARE_TOKEN_INVALID);
      } else if (errorMessage.includes('expired')) {
        setError(ERROR_MESSAGES.SHARE_TOKEN_EXPIRED);
      } else if (errorMessage.includes('not found') || errorMessage.includes('no longer exists')) {
        setError(ERROR_MESSAGES.CD_NOT_FOUND);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilePreview = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleContinueAsGuest = () => {
    setShowGuestPrompt(false);
    setHasAcceptedGuest(true);
    // Store in session storage so they don't see it again this session
    if (token) {
      sessionStorage.setItem(`guest_accepted_${token}`, 'true');
    }
    loadSharedCD();
  };

  // Show guest prompt first if they haven't accepted
  if (showGuestPrompt && !hasAcceptedGuest && cd) {
    return (
      <>
        <GuestPromptModal
          isOpen={showGuestPrompt}
          onContinueAsGuest={handleContinueAsGuest}
          cdName={cd.name}
        />
        <div className="shared-cd-container">
          <LoadingSpinner size="large" message="Loading shared CD..." />
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="shared-cd-container">
        <LoadingSpinner size="large" message="Loading shared CD..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-cd-container">
        <div className="error-state" role="alert">
          <div className="error-state__icon">⚠️</div>
          <h2 className="error-state__title">Unable to Access CD</h2>
          <p className="error-state__message">{error}</p>
          <div className="error-state__actions">
            <a href="/" className="button button-primary">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!cd) {
    return (
      <div className="shared-cd-container">
        <div className="error-state" role="alert">
          <div className="error-state__icon">💿</div>
          <h2 className="error-state__title">CD Not Found</h2>
          <p className="error-state__message">This shared CD may have expired or been removed.</p>
          <div className="error-state__actions">
            <a href="/" className="button button-primary">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const usedMB = (cd.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = (cd.storageLimitBytes / (1024 * 1024)).toFixed(0);

  return (
    <div className="shared-cd-container">
      {/* Owner banner */}
      <div className="shared-cd-banner">
        <span className="banner-icon">🎵</span>
        <span className="banner-text">
          Shared by <strong>{ownerEmail}</strong>
        </span>
      </div>

      {/* CD header */}
      <div className="cd-header">
        <div className="cd-header-icon">
          <svg viewBox="0 0 100 100" className="disc-svg-large">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="url(#discGradientShared)"
              stroke="#333"
              strokeWidth="1"
            />
            <circle cx="50" cy="50" r="10" fill="#fff" stroke="#333" strokeWidth="1" />
            <path
              d="M 50 5 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <defs>
              <radialGradient id="discGradientShared">
                <stop offset="0%" stopColor="#9933FF" />
                <stop offset="50%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#00FFFF" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="cd-header-info">
          <h1>{cd.name}</h1>
          {cd.label && <p className="cd-label-text">{cd.label}</p>}
          
          <div className="cd-storage-info">
            <div className="storage-bar-large">
              <div
                className="storage-bar-fill"
                style={{ width: `${Math.min((cd.storageUsedBytes / cd.storageLimitBytes) * 100, 100)}%` }}
              />
            </div>
            <p className="storage-text-large">
              {usedMB} MB / {limitMB} MB • {files.length} {files.length === 1 ? 'file' : 'files'}
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="cd-content">
        {files.length === 0 ? (
          <EmptyState
            icon={<EmptyDiscIcon />}
            title="This CD is Empty"
            message="The creator hasn't added any files to this CD yet."
          />
        ) : (
          <FileList
            files={files}
            onFilePreview={handleFilePreview}
            readOnly={true}
          />
        )}
      </div>

      {/* CTA banner */}
      <div className="shared-cd-cta">
        <p>Want to create your own virtual CDs?</p>
        <a href="/" className="button button-secondary">
          Sign up for free
        </a>
      </div>

      {/* File preview modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
