/**
 * Password reset form component
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EMAIL_REGEX } from '../../utils/constants';

interface PasswordResetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PasswordResetForm({ onSuccess, onCancel }: PasswordResetFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      setServerError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-form-container">
      <h2>Reset Password</h2>
      <p className="form-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        {serverError && (
          <div className="error-banner" role="alert">
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
            id="email"
            type="email"
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
