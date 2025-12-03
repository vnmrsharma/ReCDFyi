/**
 * CD detail view component showing CD header and file list
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileList } from './FileList.tsx';
import { FileUploader } from '../upload/FileUploader.tsx';
import { FilePreviewModal } from '../preview/FilePreviewModal.tsx';
import { PublicToggle } from './PublicToggle';
import { PublicIndicator } from './PublicIndicator';
import { ViewAnalytics } from './ViewAnalytics';
import { getFileMetadata } from '../../services/fileService';
import { useAuth } from '../../hooks/useAuth';
import type { CD, MediaFile } from '../../types';
import './CDComponents.css';

export interface CDDetailViewProps {
  cd: CD;
  onCDUpdate?: () => void;
}

/**
 * Displays detailed view of a CD with file management
 */
export function CDDetailView({ cd, onCDUpdate }: CDDetailViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    loadFiles();
  }, [cd.id]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const filesData = await getFileMetadata(cd.id);
      setFiles(filesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    // Reload files and notify parent to reload CD data
    loadFiles();
    if (onCDUpdate) {
      onCDUpdate();
    }
  };

  const handleFilePreview = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleFileDeleted = () => {
    // Reload files and notify parent to reload CD data
    loadFiles();
    if (onCDUpdate) {
      onCDUpdate();
    }
  };

  const handleBack = () => {
    navigate('/collection');
  };

  const handlePublicToggleComplete = () => {
    // Notify parent to reload CD data
    if (onCDUpdate) {
      onCDUpdate();
    }
  };

  if (loading) {
    return (
      <div className="cd-detail-container">
        <div className="loading-state">
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
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cd-detail-container">
        <div className="error-state" role="alert">
          <p className="error-message">{error}</p>
          <button className="button button-primary" onClick={() => loadFiles()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const usedMB = (cd.storageUsedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = (cd.storageLimitBytes / (1024 * 1024)).toFixed(0);
  const remainingBytes = cd.storageLimitBytes - cd.storageUsedBytes;

  return (
    <div className="cd-detail-container">
      <button className="button button-back" onClick={handleBack}>
        ← Back to Collection
      </button>

      <div className="cd-header">
        <div className="cd-header-icon">
          <svg viewBox="0 0 100 100" className="disc-svg-large">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="url(#discGradientLarge)"
              stroke="#333"
              strokeWidth="1"
            />
            <circle cx="50" cy="50" r="10" fill="#fff" stroke="#333" strokeWidth="1" />
            <path
              d="M 50 5 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <defs>
              <radialGradient id="discGradientLarge">
                <stop offset="0%" stopColor="#9933FF" />
                <stop offset="50%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#00FFFF" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="cd-header-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0 }}>{cd.name}</h1>
            {cd.isPublic && <PublicIndicator viewCount={cd.viewCount} />}
          </div>
          {cd.label && <p className="cd-label-text">{cd.label}</p>}
          
          <div className="cd-storage-info">
            <div className="storage-bar-large">
              <div
                className="storage-bar-fill"
                style={{ width: `${Math.min((cd.storageUsedBytes / cd.storageLimitBytes) * 100, 100)}%` }}
              />
            </div>
            <p className="storage-text-large">
              {usedMB} MB / {limitMB} MB used
            </p>
          </div>
        </div>

        <div className="cd-header-actions">
          {user && (
            <>
              <PublicToggle
                cd={cd}
                userId={user.uid}
                onToggleComplete={handlePublicToggleComplete}
              />
            </>
          )}
        </div>
      </div>

      <div className="cd-content">
        <FileUploader
          cdId={cd.id}
          remainingSpace={remainingBytes}
          onUploadComplete={handleUploadComplete}
        />

        <FileList
          files={files}
          onFilePreview={handleFilePreview}
          onFileDeleted={handleFileDeleted}
        />
      </div>

      {/* Show analytics only for public CDs and only to the owner */}
      {cd.isPublic && user && (
        <ViewAnalytics cdId={cd.id} isOwner={cd.userId === user.uid} />
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
