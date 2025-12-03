/**
 * Password reset form component
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { EMAIL_REGEX } from '../../utils/constants';
import { LoadingOverlay } from './LoadingOverlay';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  animateTransition?: boolean;
}

export function PasswordResetForm({ onSuccess, onCancel, animateTransition = true }: PasswordResetFormProps) {
  const { resetPassword } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    setShowError(false);
    setShowSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setServerError(error.message || 'Failed to send reset email. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 300);
      setLoading(false);
    }
  };

  return (
    <div className={`password-reset-form-container ${animateTransition && !prefersReducedMotion ? 'form-transition-enter' : ''} ${showSuccess && !prefersReducedMotion ? 'success-state' : ''}`} style={{ position: 'relative' }}>
      {loading && <LoadingOverlay message="Sending reset email..." />}
      <h2>Reset Password</h2>
      <p className="form-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        {serverError && (
          <div className={`error-banner ${showError && !prefersReducedMotion ? 'error-state' : ''}`} role="alert">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="success-banner" role="alert">
            {successMessage}
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
            disabled={loading || !!successMessage}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-text" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={loading || !!successMessage}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>

        {onCancel && (
          <div className="form-footer">
            <button
              type="button"
              className="link-button"
              onClick={onCancel}
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
