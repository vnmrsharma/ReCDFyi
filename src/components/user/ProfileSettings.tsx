/**
 * ProfileSettings component
 * Allows users to view and update their username
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUsername } from '../../services/userService';
import { validateUsername } from '../../services/validationService';
import { useToast } from '../../hooks/useToast';
import './UserComponents.css';

export function ProfileSettings() {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewUsername(user?.username || '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername(user?.username || '');
    setError(null);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
    setError(null);
  };

  const handleSaveUsername = async () => {
    if (!user) {
      setError('User not found');
      return;
    }

    const trimmedUsername = newUsername.trim();

    // Check if username actually changed (only if user already has a username)
    if (user.username && trimmedUsername === user.username) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate new username
      const validation = await validateUsername(trimmedUsername);
      
      if (!validation.valid) {
        setError(validation.errors[0]);
        setIsLoading(false);
        return;
      }

      // Check if this is initial username setup or username change
      if (!user.username) {
        // Initial username setup - use migration function
        const { setUsernameDuringMigration } = await import('../../services/userService');
        await setUsernameDuringMigration(user.uid, trimmedUsername);
      } else {
        // Username change - use update function
        await updateUsername(user.uid, user.username, trimmedUsername);
      }

      showSuccess('Username updated successfully!');
      setIsEditing(false);
      
      // Reload page to refresh user data
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to update username:', err);
      setError(err.message || 'Failed to update username. Please try again.');
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-settings">
      <div className="settings-section">
        <h2 className="settings-title">Profile Settings</h2>
        
        <div className="settings-field">
          <label className="settings-label">Email</label>
          <div className="settings-value">{user.email}</div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Username</label>
          {!isEditing ? (
            <div className="settings-value-row">
              <span className="username-display">
                @{user.username || '(not set)'}
              </span>
              <button
                className="button button-secondary button-small"
                onClick={handleEditClick}
              >
                {user.username ? 'Edit' : 'Set Username'}
              </button>
            </div>
          ) : (
            <div className="username-edit-container">
              <div className="username-input-wrapper">
                <span className="username-prefix">@</span>
                <input
                  type="text"
                  className="username-input"
                  value={newUsername}
                  onChange={handleUsernameChange}
                  disabled={isLoading}
                  placeholder="Enter new username"
                  maxLength={20}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="username-edit-actions">
                <button
                  className="button button-primary button-small"
                  onClick={handleSaveUsername}
                  disabled={isLoading || !newUsername.trim()}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="button button-secondary button-small"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="settings-info">
          <p className="info-text">
            Your username is displayed on all your public CDs and appears in the marketplace.
            Changing your username will update all references across the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
