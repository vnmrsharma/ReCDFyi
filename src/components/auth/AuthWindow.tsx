import { ReactNode } from 'react';
import './AuthWindow.css';

export interface AuthWindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * AuthWindow component that renders a retro-styled window with title bar and chrome elements
 * Mimics classic Windows 98/2000 window appearance with beveled borders and 3D effects
 */
export function AuthWindow({ 
  title,
  children,
  onClose,
  showCloseButton = false
}: AuthWindowProps) {
  return (
    <div className="auth-window" role="dialog" aria-labelledby="auth-window-title">
      <div className="auth-window-title-bar" role="banner">
        <span id="auth-window-title" className="auth-window-title">{title}</span>
        <div className="auth-window-title-bar-buttons" role="group" aria-label="Window controls">
          <button 
            className="auth-window-button auth-window-button-minimize"
            aria-label="Minimize (decorative)"
            disabled
            tabIndex={-1}
          >
            <span aria-hidden="true">_</span>
          </button>
          <button 
            className="auth-window-button auth-window-button-maximize"
            aria-label="Maximize (decorative)"
            disabled
            tabIndex={-1}
          >
            <span aria-hidden="true">□</span>
          </button>
          {showCloseButton && (
            <button 
              className="auth-window-button auth-window-button-close"
              onClick={onClose}
              aria-label="Close authentication window"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
          {!showCloseButton && (
            <button 
              className="auth-window-button auth-window-button-close"
              aria-label="Close (decorative)"
              disabled
              tabIndex={-1}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      </div>
      <div className="auth-window-content">
        {children}
      </div>
    </div>
  );
}
