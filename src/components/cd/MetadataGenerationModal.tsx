/**
 * Modal component for displaying AI metadata generation progress
 * Shows when a CD is being made public and metadata is being generated
 */

import { useEffect } from 'react';
import type { MetadataGenerationProgress } from '../../services/cdMetadataService';
import './MetadataGenerationModal.css';

interface MetadataGenerationModalProps {
  isOpen: boolean;
  progress: MetadataGenerationProgress | null;
  onClose: () => void;
}

export function MetadataGenerationModal({
  isOpen,
  progress,
  onClose,
}: MetadataGenerationModalProps) {
  // Auto-close on completion after a short delay
  useEffect(() => {
    if (progress?.status === 'complete') {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [progress?.status, onClose]);

  if (!isOpen) return null;

  return (
    <div className="metadata-modal-overlay">
      <div className="metadata-modal">
        <div className="metadata-modal-content">
          <h3 className="metadata-modal-title">
            {progress?.status === 'complete' ? '✓ Analysis Complete' : '🤖 Analyzing Your CD'}
          </h3>
          
          <p className="metadata-modal-description">
            {progress?.status === 'processing' && 
              'Generating smart metadata for better search and discovery...'}
            {progress?.status === 'complete' && 
              'Your CD is now public with intelligent search metadata!'}
            {progress?.status === 'error' && 
              'Metadata generation encountered an issue, but your CD is still public.'}
          </p>

          {progress && progress.status === 'processing' && (
            <>
              <div className="metadata-progress-bar">
                <div 
                  className="metadata-progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              
              <p className="metadata-progress-text">
                {progress.current} of {progress.total} files analyzed ({progress.percentage}%)
              </p>
            </>
          )}

          {progress?.status === 'error' && progress.error && (
            <p className="metadata-error-text">
              {progress.error}
            </p>
          )}

          {progress?.status === 'complete' && (
            <button 
              className="metadata-close-button"
              onClick={onClose}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
