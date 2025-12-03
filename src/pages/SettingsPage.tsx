/**
 * Settings page for user profile management
 */

import { useNavigate } from 'react-router-dom';
import { ProfileSettings } from '../components/user/ProfileSettings';
import { RetroLayout, PageHeader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import './pages.css';

/**
 * Page component for user settings
 */
export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <RetroLayout>
      <div className="settings-page">
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
                <button
                  className="nav-link active"
                  onClick={() => navigate('/settings')}
                >
                  Settings
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
        
        <PageHeader
          title="Settings"
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/>
            </svg>
          }
        />
        
        <main className="page-content">
          <ProfileSettings />
        </main>
      </div>
    </RetroLayout>
  );
}
