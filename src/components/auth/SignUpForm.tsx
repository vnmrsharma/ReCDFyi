/**
 * Sign up form component with validation
 */

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '../../utils/constants';
import { 
  validateUsernameFormat, 
  checkUsernameAvailability,
  generateUsernameSuggestions 
} from '../../services/validationService';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Real-time username availability checking
  useEffect(() => {
    const checkUsername = async () => {
      if (!username) {
        setUsernameSuggestions([]);
        return;
      }

      // First validate format
      const formatResult = validateUsernameFormat(username);
      if (!formatResult.valid) {
        setUsernameSuggestions([]);
        return;
      }

      // Then check availability
      setCheckingUsername(true);
      try {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          const suggestions = generateUsernameSuggestions(username);
          setUsernameSuggestions(suggestions);
          setErrors(prev => ({
            ...prev,
            username: 'This username is already taken'
          }));
        } else {
          setUsernameSuggestions([]);
          setErrors(prev => {
            const { username, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    };

    // Debounce the username check
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!username) {
      newErrors.username = 'Username is required';
    } else {
      const formatResult = validateUsernameFormat(username);
      if (!formatResult.valid) {
        newErrors.username = formatResult.errors[0];
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    // Final check for username availability
    setLoading(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        const suggestions = generateUsernameSuggestions(username);
        setUsernameSuggestions(suggestions);
        setErrors(prev => ({
          ...prev,
          username: 'This username is already taken'
        }));
        setLoading(false);
        return;
      }
    } catch (error) {
      setServerError('Failed to validate username. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, username);
      onSuccess?.();
    } catch (error: any) {
      setServerError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form-container">
      <h2>Create Account</h2>
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            disabled={loading}
            placeholder="3-20 characters, letters, numbers, and underscores"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {checkingUsername && (
            <span className="info-text">Checking availability...</span>
          )}
          {errors.username && (
            <span id="username-error" className="error-text" role="alert">
              {errors.username}
            </span>
          )}
          {usernameSuggestions.length > 0 && (
            <div className="username-suggestions">
              <span className="info-text">Try: </span>
              {usernameSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setUsername(suggestion);
                    setUsernameSuggestions([]);
                  }}
                  disabled={loading}
                >
                  @{suggestion}
                  {index < usernameSuggestions.length - 1 && ', '}
                </button>
              ))}
            </div>
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <span id="confirm-password-error" className="error-text" role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {onSwitchToLogin && (
          <div className="form-footer">
            <span>Already have an account? </span>
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Log In
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
