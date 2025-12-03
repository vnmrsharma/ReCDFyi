/**
 * Collection page displaying all user CDs
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CDCollection } from '../components/cd/CDCollection';
import { CreateCDModal } from '../components/cd/CreateCDModal';
import { RetroLayout, PageHeader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import './pages.css';

/**
 * Page component for displaying the user's CD collection
 */
export function CollectionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      <div className="collection-page">
        <header className="page-header">
          <div className="header-content">
            <h1 className="app-title">ReCd(fyi)</h1>
            <div className="header-actions">
              <nav className="header-nav">
                <button
                  className="nav-link active"
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
                  className="nav-link"
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
          title="My CD Collection"
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          }
          actions={
            <button
              className="button button-primary"
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Create new CD"
            >
              + Create New CD
            </button>
          }
        />
        
        <main className="page-content">
          <CDCollection hideHeader />
        </main>
      </div>
      
      <CreateCDModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </RetroLayout>
  );
}
