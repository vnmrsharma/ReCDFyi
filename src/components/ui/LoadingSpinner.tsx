/**
 * LoadingSpinner component
 * CD spinning animation for loading states
 */

import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner loading-spinner-${size}`}>
        <div className="spinner-disc">
          <div className="spinner-disc-inner">
            <div className="spinner-disc-hole"></div>
            <div className="spinner-disc-reflection"></div>
          </div>
        </div>
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
}
