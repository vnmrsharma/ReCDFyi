/**
 * Authentication page with login, signup, and password reset forms
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';
import { RetroLayout } from '../components/ui/RetroLayout';
import './pages.css';

type AuthView = 'login' | 'signup' | 'reset';

/**
 * Authentication page that handles login, signup, and password reset
 */
export function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, default to collection
  const from = (location.state as any)?.from?.pathname || '/collection';

  const handleAuthSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleResetSuccess = () => {
    setView('login');
  };

  return (
    <RetroLayout>
      <div className="auth-page">
        {view === 'login' && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={() => setView('signup')}
            onForgotPassword={() => setView('reset')}
          />
        )}

        {view === 'signup' && (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'reset' && (
          <PasswordResetForm
            onSuccess={handleResetSuccess}
            onCancel={() => setView('login')}
          />
        )}
      </div>
    </RetroLayout>
  );
}
