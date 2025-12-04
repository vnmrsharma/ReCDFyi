/**
 * File list component for displaying files within a CD
 */

import React from 'react';
import { getFileDownloadURL } from '../../services/fileService.ts';
import { generateZipDownload } from '../../utils/zipGenerator.ts';
import { EmptyState } from '../ui/EmptyState';
import type { MediaFile } from '../../types';
import './CDComponents.css';

interface FileListProps {
  files: MediaFile[];
  onFilePreview: (file: MediaFile) => void;
  onFileDeleted?: () => void;
  readOnly?: boolean;
}

/**
 * Displays a list of files with thumbnails and actions
 */
export function FileList({ files, onFilePreview, onFileDeleted, readOnly = false }: FileListProps) {
  const [downloadingFile, setDownloadingFile] = React.useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = React.useState(false);

  const handleFileDownload = async (file: MediaFile) => {
    try {
      setDownloadingFile(file.id);
      const downloadURL = await getFileDownloadURL(file.storagePath);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = file.originalName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Download failed:', error);
      alert(`Failed to download file: ${error.message}`);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;

    try {
      setDownloadingAll(true);
      const zipBlob = await generateZipDownload(files);
      
      // Create download link for zip
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cd-files.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Zip download failed:', error);
      alert(`Failed to download CD: ${error.message}`);
    } finally {
      setDownloadingAll(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      case 'video':
        return '🎬';
      default:
        return '📄';
    }
  };

  if (files.length === 0) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 100 100" width="100" height="100">
            <rect x="20" y="30" width="60" height="50" fill="none" stroke="#808080" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M 35 45 L 45 55 L 65 35" stroke="#808080" strokeWidth="2" fill="none" strokeDasharray="5 5" />
          </svg>
        }
        title="No Files Yet"
        message="Upload some media to get started!"
      />
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h2>Files ({files.length})</h2>
        <button
          className="button button-secondary"
          onClick={handleDownloadAll}
          disabled={downloadingAll}
        >
          {downloadingAll ? 'Creating Zip...' : '⬇ Download All'}
        </button>
      </div>

      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-icon">
              {getFileIcon(file.fileType)}
            </div>

            <div className="file-info">
              <p className="file-name">{file.originalName}</p>
              <p className="file-meta">
                {file.fileType} • {formatFileSize(file.sizeBytes)}
              </p>
              {file.aiMetadata && (
                <div className="file-ai-tags">
                  {file.aiMetadata.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="file-ai-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="file-actions">
              <button
                className="button button-small"
                onClick={() => onFilePreview(file)}
                title="Preview file"
              >
                👁️ Preview
              </button>
              <button
                className="button button-small"
                onClick={() => handleFileDownload(file)}
                disabled={downloadingFile === file.id}
                title="Download file"
              >
                {downloadingFile === file.id ? '...' : '⬇ Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
