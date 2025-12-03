/**
 * Public route component for pages that should redirect authenticated users
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper for public pages (like auth)
 * Redirects authenticated users to their collection
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="route-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to collection if already authenticated
  if (user) {
    return <Navigate to="/collection" replace />;
  }

  // User is not authenticated, render the public content
  return <>{children}</>;
}
