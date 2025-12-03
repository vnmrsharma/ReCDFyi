/**
 * DiscAnimation component
 * CD insert/eject animations for retro aesthetic
 */

import { useEffect, useState } from 'react';
import './DiscAnimation.css';

export interface DiscAnimationProps {
  type: 'insert' | 'eject';
  onComplete?: () => void;
  duration?: number;
}

export function DiscAnimation({ type, onComplete, duration = 500 }: DiscAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isAnimating) {
    return null;
  }

  return (
    <div className="disc-animation-overlay">
      <div className={`disc-animation disc-animation-${type}`}>
        <div className="disc">
          <div className="disc-inner">
            <div className="disc-hole"></div>
            <div className="disc-reflection"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
