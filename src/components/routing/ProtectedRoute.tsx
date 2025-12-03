/**
 * Protected route component that requires authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresUsername?: boolean;
}

/**
 * Route wrapper that requires user authentication
 * Redirects to auth page if user is not logged in
 * Can optionally require username to be set (for marketplace/profile features)
 */
export function ProtectedRoute({ children, requiresUsername = false }: ProtectedRouteProps) {
  const { user, loading, needsUsername } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="route-loading">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  // Save the attempted location so we can redirect back after login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If route requires username and user hasn't set one, redirect to collection
  // The username prompt modal will be shown by AuthContext
  if (requiresUsername && needsUsername) {
    return <Navigate to="/collection" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
