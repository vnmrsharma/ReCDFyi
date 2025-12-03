/**
 * Login form component with error handling
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { EMAIL_REGEX } from '../../utils/constants';
import { LoadingOverlay } from './LoadingOverlay';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
  animateTransition?: boolean;
}

export function LoginForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
  animateTransition = true,
}: LoginFormProps) {
  const { login } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Auto-focus first input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    
    // Trigger error animation if validation fails
    if (Object.keys(newErrors).length > 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 300);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setShowError(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      
      // Show success state before redirect
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 800);
    } catch (error: any) {
      setServerError(error.message || 'Failed to log in. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 300);
      setLoading(false);
    }
  };

  return (
    <div className={`login-form-container ${animateTransition && !prefersReducedMotion ? 'form-transition-enter' : ''} ${showSuccess && !prefersReducedMotion ? 'success-state' : ''}`} style={{ position: 'relative' }}>
      {loading && <LoadingOverlay message="Logging in..." />}
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {showSuccess && (
          <div className="success-banner" role="alert">
            Login successful! Redirecting...
          </div>
        )}
        
        {serverError && (
          <div className={`error-banner ${showError && !prefersReducedMotion ? 'error-state' : ''}`} role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-text" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <span id="password-error" className="error-text" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <div className="form-footer">
          {onForgotPassword && (
            <button
              type="button"
              className="link-button"
              onClick={onForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          )}
          {onSwitchToSignUp && (
            <div>
              <span>Don't have an account? </span>
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToSignUp}
                disabled={loading}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
