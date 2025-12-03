/**
 * Public toggle component for switching CD visibility between public and private
 */

import { useState } from 'react';
import { toggleCDPublic } from '../../services/publicCDService';
import type { CD } from '../../types';
import './CDComponents.css';

interface PublicToggleProps {
  cd: CD;
  userId: string;
  onToggleComplete: () => void;
}

/**
 * Toggle switch for making a CD public or private with confirmation dialog
 */
export function PublicToggle({ cd, userId, onToggleComplete }: PublicToggleProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleClick = () => {
    if (cd.isPublic) {
      // Making private - no confirmation needed
      performToggle(false);
    } else {
      // Making public - show confirmation
      setShowConfirmation(true);
    }
  };

  const handleConfirmPublic = () => {
    setShowConfirmation(false);
    performToggle(true);
  };

  const handleCancelPublic = () => {
    setShowConfirmation(false);
  };

  const performToggle = async (newPublicState: boolean) => {
    setIsToggling(true);
    setError(null);

    try {
      await toggleCDPublic(cd.id, userId, newPublicState);
      onToggleComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to update CD visibility');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="public-toggle-container">
        <label className="public-toggle-label">
          <span className="toggle-text">
            {cd.isPublic ? 'Public' : 'Private'}
          </span>
          <button
            className={`toggle-switch ${cd.isPublic ? 'toggle-on' : 'toggle-off'}`}
            onClick={handleToggleClick}
            disabled={isToggling}
            aria-label={cd.isPublic ? 'Make CD private' : 'Make CD public'}
            aria-pressed={cd.isPublic}
          >
            <span className="toggle-slider" />
          </button>
        </label>
        {error && (
          <p className="toggle-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {showConfirmation && (
        <div className="modal-overlay" onClick={handleCancelPublic}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Make CD Public?</h2>
              <button
                className="close-button"
                onClick={handleCancelPublic}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Making this CD public will allow anyone to view and download its contents
                from the marketplace. Are you sure you want to continue?
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={handleCancelPublic}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={handleConfirmPublic}
              >
                Make Public
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
