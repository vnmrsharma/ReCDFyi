/**
 * Public toggle component for switching CD visibility between public and private
 */

import { useState } from 'react';
import { toggleCDPublic } from '../../services/publicCDService';
import { useMetadataGeneration } from '../../hooks/useMetadataGeneration';
import { shouldGenerateMetadata } from '../../services/cdMetadataService';
import { MetadataGenerationModal } from './MetadataGenerationModal';
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
  const { isGenerating, progress, generateMetadata, reset } = useMetadataGeneration();

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
      
      // Call onToggleComplete immediately so CD becomes public
      onToggleComplete();
      
      // If making public and metadata not yet generated, trigger generation
      if (newPublicState && shouldGenerateMetadata({ isPublic: newPublicState, aiMetadataGenerated: cd.aiMetadataGenerated })) {
        // Start metadata generation asynchronously (non-blocking)
        generateMetadata(cd.id)
          .then(() => {
            // Refresh CD data after metadata generation completes
            onToggleComplete();
          })
          .catch((err) => {
            console.error('Metadata generation failed:', err);
            // Don't block the UI - metadata generation is optional
          });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update CD visibility');
    } finally {
      setIsToggling(false);
    }
  };
  
  const handleMetadataModalClose = () => {
    reset();
    // Force page reload to show updated metadata
    window.location.reload();
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
                from the marketplace.
              </p>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                We'll automatically generate smart metadata to make your CD easier to discover through search.
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
      
      <MetadataGenerationModal
        isOpen={isGenerating}
        progress={progress}
        onClose={handleMetadataModalClose}
      />
    </>
  );
}
