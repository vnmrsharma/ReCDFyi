/**
 * Authentication page with login, signup, and password reset forms
 * Enhanced with Y2K aesthetic including animated backgrounds, retro window chrome,
 * welcome messages, and decorative elements
 */

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { AnimatedBackground } from '../components/auth/AnimatedBackground';
import { AuthWindow } from '../components/auth/AuthWindow';
import { WelcomeMessage } from '../components/auth/WelcomeMessage';
import { RetroLayout } from '../components/ui/RetroLayout';
import { useIsMobile } from '../hooks/useMediaQuery';
import './pages.css';

// Lazy load decorative elements for better performance
// Only loaded on desktop devices
const DecorativeElements = lazy(() => 
  import('../components/auth/DecorativeElements').then(module => ({
    default: module.DecorativeElements
  }))
);

type AuthView = 'login' | 'signup' | 'reset';

/**
 * Authentication page that handles login, signup, and password reset
 * with smooth view transitions, animated backgrounds, and retro styling
 * 
 * Requirements: 1.1, 3.1, 4.1, 7.1
 */
export function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Get the redirect path from location state, default to collection
  const from = (location.state as any)?.from?.pathname || '/collection';

  // Handle view transitions with animation
  const handleViewChange = (newView: AuthView) => {
    if (newView === view) return;

    // Start transition
    setIsTransitioning(true);

    // Wait for fade-out animation (150ms)
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 150);
  };

  // Auto-focus first input after view transition completes
  useEffect(() => {
    if (!isTransitioning && formContainerRef.current) {
      // Find the first input element in the form
      const firstInput = formContainerRef.current.querySelector<HTMLInputElement>(
        'input[type="email"], input[type="text"]'
      );
      
      if (firstInput) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          firstInput.focus();
        }, 50);
      }
    }
  }, [view, isTransitioning]);

  const handleAuthSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleResetSuccess = () => {
    handleViewChange('login');
  };

  // Get window title based on current view
  const getWindowTitle = () => {
    switch (view) {
      case 'login':
        return 'ReCd(fyi) - Login';
      case 'signup':
        return 'ReCd(fyi) - Sign Up';
      case 'reset':
        return 'ReCd(fyi) - Password Reset';
    }
  };

  return (
    <RetroLayout>
      {/* Animated background with Y2K gradient effects */}
      <AnimatedBackground variant="gradient" animated={true} />
      
      {/* Decorative elements (desktop only) - lazy loaded for performance */}
      {!isMobile && (
        <Suspense fallback={null}>
          <DecorativeElements density="normal" />
        </Suspense>
      )}
      
      <div className="auth-page">
        <div 
          ref={formContainerRef}
          className={`auth-form-container ${isTransitioning ? 'transitioning' : ''}`}
          role="main"
          aria-label="Authentication"
        >
          {/* Retro window chrome wrapper */}
          <AuthWindow title={getWindowTitle()} showCloseButton={false}>
            {/* Welcome message above forms */}
            <WelcomeMessage view={view} />
            
            {/* Form content */}
            {view === 'login' && (
              <LoginForm
                key="login"
                onSuccess={handleAuthSuccess}
                onSwitchToSignUp={() => handleViewChange('signup')}
                onForgotPassword={() => handleViewChange('reset')}
                animateTransition={!isTransitioning}
              />
            )}

            {view === 'signup' && (
              <SignUpForm
                key="signup"
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => handleViewChange('login')}
                animateTransition={!isTransitioning}
              />
            )}

            {view === 'reset' && (
              <PasswordResetForm
                key="reset"
                onSuccess={handleResetSuccess}
                onCancel={() => handleViewChange('login')}
                animateTransition={!isTransitioning}
              />
            )}
          </AuthWindow>
        </div>
      </div>
    </RetroLayout>
  );
}
