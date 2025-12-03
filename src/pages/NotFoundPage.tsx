/**
 * 404 Not Found page
 */

import { useNavigate } from 'react-router-dom';
import { RetroLayout } from '../components/ui/RetroLayout';
import { useAuth } from '../hooks/useAuth';
import './pages.css';

/**
 * 404 error page displayed when route is not found
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      navigate('/collection');
    } else {
      navigate('/auth');
    }
  };

  return (
    <RetroLayout>
      <div className="error-page not-found-page">
        <div className="error-content">
          <h1 className="error-code">404</h1>
          <h2 className="error-title">Page Not Found</h2>
          <p className="error-message">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="error-actions">
            <button className="button button-primary" onClick={handleGoHome}>
              {user ? 'Go to Collection' : 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    </RetroLayout>
  );
}
