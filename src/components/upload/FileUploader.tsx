/**
 * FileUploader component with drag-and-drop support
 * Allows users to select and upload files to a CD
 */

import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateFiles } from '../../services/validationService';
import { uploadFile } from '../../services/fileService';
import { BurningProgress } from './BurningProgress';
import type { ValidationResult } from '../../types';
import './FileUploader.css';

interface FileUploaderProps {
  cdId: string;
  remainingSpace: number;
  onUploadComplete?: () => void;
  disabled?: boolean;
}

export function FileUploader({
  cdId,
  remainingSpace,
  onUploadComplete,
  disabled = false,
}: FileUploaderProps) {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    fileIndex: number;
    totalFiles: number;
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
  }>({
    fileIndex: 0,
    totalFiles: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    percentage: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates and processes selected files
   */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    if (!user) {
      setValidationErrors(['You must be logged in to upload files']);
      return;
    }

    const fileArray = Array.from(files);
    
    // Validate files
    const validation: ValidationResult = validateFiles(fileArray, remainingSpace);
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear errors and start upload
    setValidationErrors([]);
    setUploadError(null);
    await uploadFiles(fileArray);
  };

  /**
   * Uploads files sequentially
   */
  const uploadFiles = async (files: File[]) => {
    if (!user) return;

    setUploading(true);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

    try {
      let uploadedBytes = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        await uploadFile(cdId, user.uid, file, (progress) => {
          const currentFileBytes = (file.size * progress) / 100;
          const totalTransferred = uploadedBytes + currentFileBytes;

          setUploadProgress({
            fileIndex: i,
            totalFiles: files.length,
            bytesTransferred: totalTransferred,
            totalBytes,
            percentage: (totalTransferred / totalBytes) * 100,
          });
        });

        uploadedBytes += file.size;
      }

      // Upload complete
      setUploadError(null);
      setFailedFiles([]);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      // Store error and failed files for retry
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      setFailedFiles(files);
    } finally {
      setUploading(false);
      setUploadProgress({
        fileIndex: 0,
        totalFiles: 0,
        bytesTransferred: 0,
        totalBytes: 0,
        percentage: 0,
      });
    }
  };

  /**
   * Retry failed upload
   */
  const handleRetry = () => {
    if (failedFiles.length > 0) {
      setUploadError(null);
      uploadFiles(failedFiles);
    }
  };

  /**
   * Handle drag enter event
   */
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const remainingMB = (remainingSpace / (1024 * 1024)).toFixed(2);

  if (uploading) {
    return (
      <BurningProgress
        progress={uploadProgress}
      />
    );
  }

  return (
    <div className="file-uploader">
      <div
        className={`file-uploader__drop-zone ${
          isDragging ? 'file-uploader__drop-zone--dragging' : ''
        } ${disabled ? 'file-uploader__drop-zone--disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="file-uploader__icon">💿</div>
        <p className="file-uploader__text">
          {isDragging
            ? 'Drop files here'
            : 'Drag files here or click to upload'}
        </p>
        <p className="file-uploader__info">
          Remaining space: {remainingMB} MB
        </p>
        <p className="file-uploader__formats">
          Supported: JPG, PNG, MP3, WAV, MP4
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.mp3,.wav,.mp4"
        onChange={handleFileInputChange}
        className="file-uploader__input"
        disabled={disabled}
      />

      {validationErrors.length > 0 && (
        <div className="file-uploader__errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="file-uploader__error">
              {error}
            </p>
          ))}
        </div>
      )}

      {uploadError && (
        <div className="file-uploader__upload-error">
          <p className="file-uploader__error">{uploadError}</p>
          <button
            className="file-uploader__retry-button"
            onClick={handleRetry}
            disabled={uploading}
          >
            Retry Upload
          </button>
        </div>
      )}
    </div>
  );
}
