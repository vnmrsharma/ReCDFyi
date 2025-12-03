/**
 * Modal component for previewing files
 */

import React, { useEffect, useState } from 'react';
import { ImageViewer } from './ImageViewer';
import { AudioPlayer } from './AudioPlayer';
import { VideoPlayer } from './VideoPlayer';
import { getFileDownloadURL } from '../../services/fileService';
import type { MediaFile } from '../../types';
import './PreviewComponents.css';

interface FilePreviewModalProps {
  file: MediaFile;
  onClose: () => void;
}

/**
 * Modal that displays appropriate preview component based on file type
 */
export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFileURL();
  }, [file]);

  const loadFileURL = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await getFileDownloadURL(file.storagePath);
      setFileURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="preview-loading">
          <div className="loading-spinner">
            <svg viewBox="0 0 100 100" className="spinner-disc">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#0066FF"
                strokeWidth="8"
                strokeDasharray="60 200"
              />
            </svg>
          </div>
          <p>Loading preview...</p>
        </div>
      );
    }

    if (error || !fileURL) {
      return (
        <div className="preview-error">
          <p>{error || 'Failed to load file'}</p>
        </div>
      );
    }

    switch (file.fileType) {
      case 'image':
        return <ImageViewer url={fileURL} alt={file.originalName} />;
      case 'audio':
        return <AudioPlayer url={fileURL} filename={file.originalName} />;
      case 'video':
        return <VideoPlayer url={fileURL} filename={file.originalName} />;
      default:
        return <div className="preview-error">Unsupported file type</div>;
    }
  };

  return (
    <div className="preview-modal-backdrop" onClick={handleBackdropClick}>
      <div className="preview-modal">
        <div className="preview-modal-header">
          <h2>{file.originalName}</h2>
          <button
            className="button button-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="preview-modal-content">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
