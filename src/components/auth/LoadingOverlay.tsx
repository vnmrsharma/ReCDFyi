/**
 * LoadingOverlay component for auth forms
 * Displays a semi-transparent overlay with retro spinner during authentication
 */

import { LoadingSpinner } from '../ui/LoadingSpinner';
import './LoadingOverlay.css';

export interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Authenticating...' }: LoadingOverlayProps) {
  return (
    <div className="auth-loading-overlay" role="status" aria-live="polite">
      <div className="auth-loading-content">
        <LoadingSpinner size="medium" message={message} />
      </div>
    </div>
  );
}
