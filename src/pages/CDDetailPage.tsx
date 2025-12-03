/**
 * CD detail page for viewing and managing a specific CD
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CDDetailView } from '../components/cd/CDDetailView';
import { RetroLayout, PageHeader, LoadingSpinner } from '../components/ui';
import { ShareButton } from '../components/share/ShareButton';
import { useAuth } from '../hooks/useAuth';
import { getCD, deleteCD } from '../services/cdService';
import { sendShareEmail } from '../services/emailService';
import type { CD } from '../types';
import '../components/ui/RetroButton.css';
import './pages.css';

/**
 * Page component for displaying CD details and managing files
 */
export function CDDetailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cdId } = useParams<{ cdId: string }>();
  
  const [cd, setCD] = useState<CD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCD();
  }, [cdId, user]);

  const loadCD = async () => {
    if (!cdId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cdData = await getCD(cdId, user.uid);
      setCD(cdData);
    } catch (err: any) {
      setError(err.message || 'Failed to load CD');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSendEmail = async (recipientEmail: string, shareUrl: string, customMessage?: string) => {
    if (!user || !cd) return;
    await sendShareEmail(recipientEmail, shareUrl, cd.name, user.email, user.uid, cd.id, customMessage);
  };

  const handleDelete = async () => {
    if (!cd || !user || isDeleting) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cd.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteCD(cd.id, user.uid);
      navigate('/collection', { replace: true });
    } catch (err: any) {
      alert(`Failed to delete CD: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const handleCDUpdate = () => {
    loadCD();
  };

  return (
    <RetroLayout>
      <div className="cd-detail-page">
        <header className="page-header">
          <div className="header-content">
            <h1 className="app-title">ReCd(fyi)</h1>
            <div className="header-actions">
              <nav className="header-nav">
                <button
                  className="nav-link"
                  onClick={() => navigate('/collection')}
                >
                  My CDs
                </button>
                <button
                  className="nav-link"
                  onClick={() => navigate('/marketplace')}
                >
                  Marketplace
                </button>
              </nav>
              {user?.username && (
                <button
                  className="nav-link username-link"
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  @{user.username}
                </button>
              )}
              <button className="button button-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        
        {loading ? (
          <main className="page-content">
            <LoadingSpinner size="large" message="Loading CD..." />
          </main>
        ) : error || !cd ? (
          <main className="page-content">
            <div className="error-state" role="alert">
              <div className="error-state__icon">💿</div>
              <h2 className="error-state__title">Error Loading CD</h2>
              <p className="error-state__message">{error || 'CD not found'}</p>
              <div className="error-state__actions">
                <button className="button button-primary" onClick={() => navigate('/collection')}>
                  Back to Collection
                </button>
              </div>
            </div>
          </main>
        ) : (
          <>
            <PageHeader
              title={cd.name}
              subtitle={cd.label || undefined}
              icon={
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              }
              actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                  {user && (
                    <>
                      <ShareButton
                        cd={cd}
                        userId={user.uid}
                        onSendEmail={handleSendEmail}
                        className="retro-button retro-button-primary"
                      />
                      <button
                        className="retro-button retro-button-danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        aria-label="Delete CD"
                      >
                        {isDeleting ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </>
                  )}
                </div>
              }
            />
            
            <main className="page-content">
              <CDDetailView cd={cd} onCDUpdate={handleCDUpdate} />
            </main>
          </>
        )}
      </div>
    </RetroLayout>
  );
}
