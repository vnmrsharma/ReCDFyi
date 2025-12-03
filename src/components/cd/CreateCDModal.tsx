/**
 * Modal component for creating new CDs
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { createCD } from '../../services/cdService';
import { validateCDName } from '../../services/validationService';
import { useAuth } from '../../hooks/useAuth';
import { useCDs } from '../../contexts/CDContext';
import { MAX_CD_NAME_LENGTH } from '../../utils/constants';

interface CreateCDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for creating a new virtual CD
 */
export function CreateCDModal({ isOpen, onClose }: CreateCDModalProps) {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addCD } = useCDs();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a CD');
      return;
    }

    // Validate CD name
    if (!validateCDName(name)) {
      setError(`CD name must be between 1 and ${MAX_CD_NAME_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCD = await createCD(user.uid, name.trim(), label.trim() || undefined);
      addCD(newCD);
      
      // Reset form and close modal
      setName('');
      setLabel('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create CD');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setLabel('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New CD</h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cd-form">
          <div className="form-group">
            <label htmlFor="cd-name">
              CD Name <span className="required">*</span>
            </label>
            <input
              id="cd-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Mix"
              maxLength={MAX_CD_NAME_LENGTH}
              disabled={loading}
              required
              autoFocus
            />
            <small className="form-hint">
              {name.length}/{MAX_CD_NAME_LENGTH} characters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="cd-label">Label (Optional)</label>
            <input
              id="cd-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Summer 2024 Memories"
              maxLength={MAX_CD_NAME_LENGTH}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create CD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
