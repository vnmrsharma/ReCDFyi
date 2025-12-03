import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './WelcomeMessage.css';

export interface WelcomeMessageProps {
  view: 'login' | 'signup' | 'reset';
}

/**
 * WelcomeMessage component that displays context-appropriate welcome text
 * with retro typography styling and fade-in animation
 * 
 * Requirements: 7.1, 7.2, 7.3
 */
export function WelcomeMessage({ view }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Trigger fade-in animation on mount (skip if reduced motion is preferred)
  useEffect(() => {
    if (prefersReducedMotion) {
      // Immediately show content without animation
      setIsVisible(true);
      return;
    }

    // Small delay to ensure animation is visible
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Reset animation when view changes
  useEffect(() => {
    if (prefersReducedMotion) {
      // No animation needed
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [view, prefersReducedMotion]);

  const getContent = () => {
    switch (view) {
      case 'login':
        return {
          headline: 'Welcome Back to ReCd(fyi)',
          subtext: 'Share your memories, one disc at a time',
          icon: '💿'
        };
      case 'signup':
        return {
          headline: 'Join ReCd(fyi)',
          subtext: 'Create your virtual CD collection',
          icon: '🎵'
        };
      case 'reset':
        return {
          headline: 'Reset Your Password',
          subtext: "We'll help you get back in",
          icon: '🔑'
        };
    }
  };

  const content = getContent();

  return (
    <div 
      className={`welcome-message ${isVisible ? 'welcome-message-visible' : ''}`}
      role="region"
      aria-label="Welcome message"
    >
      <div className="welcome-message-icon" aria-hidden="true">
        {content.icon}
      </div>
      <h1 className="welcome-message-headline">
        {content.headline}
      </h1>
      <p className="welcome-message-subtext">
        {content.subtext}
      </p>
    </div>
  );
}
