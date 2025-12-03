/**
 * Public CD view page for viewing public CDs from the marketplace
 * Accessible to both logged-in users and guests
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RetroLayout } from '../components/ui/RetroLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FileList } from '../components/cd/FileList';
import { FilePreviewModal } from '../components/preview/FilePreviewModal';
import { EmptyState } from '../components/ui/EmptyState';
import { EmptyDiscIcon } from '../components/ui/EmptyDiscIcon';
import { getPublicCD } from '../services/publicCDService';
import { getFileMetadata } from '../services/fileService';
import { recordView } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { ERROR_MESSAGES } from '../utils/constants';
import type { PublicCD, MediaFile } from '../types';
import './pages.css';

/**
 * Page component for viewing a public CD from the marketplace
 */
export function PublicCDViewPage() {
  const { cdId } = useParams<{ cdId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [cd, setCD] = useState<PublicCD | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [viewRecorded, setViewRecorded] = useState(false);

  useEffect(() => {
    loadPublicCD();
  }, [cdId]);

  // Record view when logged-in user accesses
  useEffect(() => {
    if (cd && user && user.username && !viewRecorded) {
      recordViewAnalytics();
    }
  }, [cd, user, viewRecorded]);

  const loadPublicCD = async () => {
    if (!cdId) {
      setError('CD ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get public CD data
      const cdData = await getPublicCD(cdId);
      setCD(cdData);
      
      // Get files for the CD
      const filesData = await getFileMetadata(cdId);
      setFiles(filesData);
    } catch (err: any) {
      console.error('Failed to load public CD:', err);
      
      // Map error to user-friendly message
      const errorMessage = err.message || 'Failed to load public CD';
      
      if (errorMessage.includes('no longer exists') || errorMessage.includes('not public')) {
        setError(ERROR_MESSAGES.PUBLIC_CD_NOT_FOUND);
      } else if (errorMessage.includes('private')) {
        setError(ERROR_MESSAGES.PRIVATE_CD_ACCESS_DENIED);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const recordViewAnalytics = async () => {
    if (!cd || !user || !user.username || viewRecorded) return;

    try {
      await recordView(cd.id, user.uid, user.username);
      setViewRecorded(true);
      
      // Update local view count
      setCD((prev) => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
    } catch (err) {
      // Silently fail - analytics recording is not critical
      console.error('Failed to record view:', err);
    }
  };

  const handleFilePreview = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <RetroLayout>
        <div className="public-cd-view-page">
          <LoadingSpinner size="large" message="Loading public CD..." />
        </div>
      </RetroLayout>
    );
  }

  if (error) {
    return (
      <RetroLayout>
        <div className="public-cd-view-page">
          <header className="page-header">
            <div className="header-content">
              <h1 className="app-title">ReCd(fyi)</h1>
              <div className="header-actions">
                <button
                  className="button button-secondary"
                  onClick={() => navigate('/marketplace')}
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </header>
          <main className="page-content">
            <div className="error-state" role="alert">
              <div className="error-state__icon">⚠️</div>
              <h2 className="error-state__title">Unable to Access CD</h2>
              <p className="error-state__message">{error}</p>
              <div className="error-state__actions">
                <button
                  className="button button-primary"
                  onClick={() => navigate('/marketplace')}
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </main>
        </div>
      </RetroLayout>
    );
  }

  if (!cd) {
    return (
      <RetroLayout>
        <div className="public-cd-view-page">
          <div className="error-state" role="alert">
            <div className="error-state__icon">💿</div>
            <h2 className="error-state__title">CD Not Found</h2>
            <p className="error-state__message">This CD may have been removed or made private.</p>
            <div className="error-state__actions">
              <button
                className="button button-primary"
                onClick={() => navigate('/marketplace')}
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>
      </RetroLayout>
    );
  }

  return (
    <RetroLayout>
      <div className="public-cd-view-page">
        <header className="page-header">
          <div className="header-content">
            <h1 className="app-title">ReCd(fyi)</h1>
            <div className="header-actions">
              {user && (
                <>
                  <nav className="header-nav">
                    <button
                      className="nav-link"
                      onClick={() => navigate('/collection')}
                    >
                      My CDs
                    </button>
                    <button
                      className="nav-link active"
                      onClick={() => navigate('/marketplace')}
                    >
                      Marketplace
                    </button>
                  </nav>
                  <span className="user-email">{user.email}</span>
                  <button className="button button-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <nav className="header-nav">
                    <button
                      className="nav-link active"
                      onClick={() => navigate('/marketplace')}
                    >
                      Marketplace
                    </button>
                  </nav>
                  <button
                    className="button button-primary"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <div className="public-cd-container">
            {/* Creator banner */}
            <div className="public-cd-banner">
              <span className="banner-icon">🎵</span>
              <span className="banner-text">
                Created by{' '}
                <Link to={`/profile/${cd.username}`} className="creator-link">
                  <strong>@{cd.username}</strong>
                </Link>
              </span>
              <span className="view-count">
                👁️ {cd.viewCount} {cd.viewCount === 1 ? 'view' : 'views'}
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
                    fill="url(#discGradientPublic)"
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
                    <radialGradient id="discGradientPublic">
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
                
                <div className="cd-meta-info">
                  <p className="cd-file-count">
                    {cd.fileCount} {cd.fileCount === 1 ? 'file' : 'files'}
                  </p>
                  <p className="cd-public-date">
                    Made public {cd.publicAt.toLocaleDateString()}
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

            {/* View creator profile CTA */}
            <div className="creator-profile-cta">
              <p>Want to see more from this creator?</p>
              <Link to={`/profile/${cd.username}`} className="button button-primary">
                View @{cd.username}'s Profile
              </Link>
            </div>

            {/* Sign up CTA for guests */}
            {!user && (
              <div className="shared-cd-cta">
                <p>Want to create your own virtual CDs?</p>
                <button
                  className="button button-secondary"
                  onClick={() => navigate('/auth')}
                >
                  Sign up for free
                </button>
              </div>
            )}
          </div>
        </main>

        {/* File preview modal */}
        {previewFile && (
          <FilePreviewModal
            file={previewFile}
            onClose={handleClosePreview}
          />
        )}
      </div>
    </RetroLayout>
  );
}
