/**
 * PageTransition component
 * Provides fade in/out animations for page navigation
 */

import { ReactNode, useEffect, useState } from 'react';
import './PageTransition.css';

export interface PageTransitionProps {
  children: ReactNode;
  duration?: number;
}

export function PageTransition({ children, duration = 300 }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade in after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`page-transition ${isVisible ? 'page-transition-visible' : ''}`}
      style={{ '--transition-duration': `${duration}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
