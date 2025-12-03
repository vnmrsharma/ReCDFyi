/**
 * UsernamePromptModal - Modal for prompting existing users to set a username
 * This component is shown to users who signed up before the username feature was added
 */

import { useState, useEffect, type FormEvent } from 'react';
import { 
  validateUsernameFormat, 
  checkUsernameAvailability,
  generateUsernameSuggestions 
} from '../../services/validationService';

interface UsernamePromptModalProps {
  suggestedUsername: string;
  onSubmit: (username: string) => Promise<void>;
}

export function UsernamePromptModal({ suggestedUsername, onSubmit }: UsernamePromptModalProps) {
  const [username, setUsername] = useState(suggestedUsername);
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(false);
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
          setErrors('This username is already taken');
        } else {
          setUsernameSuggestions([]);
          setErrors('');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validate format
    const formatResult = validateUsernameFormat(username);
    if (!formatResult.valid) {
      setErrors(formatResult.errors[0]);
      return;
    }

    // Final check for username availability
    setLoading(true);
    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        const suggestions = generateUsernameSuggestions(username);
        setUsernameSuggestions(suggestions);
        setErrors('This username is already taken');
        setLoading(false);
        return;
      }

      await onSubmit(username);
    } catch (error: any) {
      setErrors(error.message || 'Failed to set username. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="username-modal-title">
      <div className="modal-content username-prompt-modal">
        <div className="modal-header">
          <h2 id="username-modal-title">Choose Your Username</h2>
          <p className="modal-description">
            To access the marketplace and public features, please choose a unique username.
            This will be your public identity on ReCd.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="username-prompt-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              disabled={loading}
              placeholder="3-20 characters, letters, numbers, and underscores"
              aria-invalid={!!errors}
              aria-describedby={errors ? 'username-error' : 'username-help'}
              autoFocus
            />
            <span id="username-help" className="help-text">
              Your username will be displayed as @{username || 'username'}
            </span>
            {checkingUsername && (
              <span className="info-text">Checking availability...</span>
            )}
            {errors && (
              <span id="username-error" className="error-text" role="alert">
                {errors}
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

          <div className="modal-actions">
            <button type="submit" className="primary-button" disabled={loading || checkingUsername}>
              {loading ? 'Setting Username...' : 'Continue'}
            </button>
          </div>

          <div className="modal-footer">
            <p className="info-text">
              You can access your collection and settings while choosing a username.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
