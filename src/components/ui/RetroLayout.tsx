/**
 * RetroLayout component
 * Fixed-width container with Y2K aesthetic and sticky footer
 */

import type { ReactNode } from 'react';
import { Footer } from './Footer';
import './RetroLayout.css';

export interface RetroLayoutProps {
  children: ReactNode;
  className?: string;
  showFooter?: boolean;
}

export function RetroLayout({ 
  children, 
  className = '',
  showFooter = true 
}: RetroLayoutProps) {
  return (
    <div className={`retro-layout ${className}`}>
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="retro-layout-content" id="main-content">
        <div className="retro-layout-container">
          {children}
        </div>
      </div>
      {showFooter && (
        <div className="retro-layout-footer">
          <Footer />
        </div>
      )}
    </div>
  );
}
