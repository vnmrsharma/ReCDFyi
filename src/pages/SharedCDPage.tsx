/**
 * Shared CD page for recipients accessing CDs via share link
 */

import { useParams } from 'react-router-dom';
import { SharedCDView } from '../components/share/SharedCDView';
import { RetroLayout } from '../components/ui/RetroLayout';
import './pages.css';

/**
 * Page component for viewing shared CDs (guest access)
 */
export function SharedCDPage() {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <RetroLayout>
        <div className="error-page">
          <h1>Invalid Share Link</h1>
          <p>This share link is missing required information.</p>
          <p>Please check the link and try again.</p>
        </div>
      </RetroLayout>
    );
  }

  return (
    <RetroLayout>
      <div className="shared-cd-page">
        <header className="page-header">
          <div className="header-content">
            <h1 className="app-title">ReCd(fyi)</h1>
            <div className="header-actions">
              <nav className="header-nav">
                <button
                  className="nav-link"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  Marketplace
                </button>
              </nav>
            </div>
          </div>
        </header>
        <main className="page-content">
          <SharedCDView />
        </main>
      </div>
    </RetroLayout>
  );
}
