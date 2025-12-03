/**
 * Login form component with error handling
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EMAIL_REGEX } from '../../utils/constants';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (error: any) {
      setServerError(error.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {serverError && (
          <div className="error-banner" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
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
