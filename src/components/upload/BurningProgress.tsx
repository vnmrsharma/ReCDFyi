/**
 * BurningProgress component with retro CD burning animation
 * Displays upload progress with spinning disc and progress bar
 */

import React from 'react';
import type { UploadProgress } from '../../types';
import './BurningProgress.css';

interface BurningProgressProps {
  progress: UploadProgress;
  fileName?: string;
  isComplete?: boolean;
}

export function BurningProgress({ progress, fileName, isComplete = false }: BurningProgressProps) {
  const { fileIndex, totalFiles, percentage } = progress;

  return (
    <div className="burning-progress">
      <div className="burning-progress__overlay">
        <div className="burning-progress__modal">
          <h2 className="burning-progress__title">Burning CD...</h2>

          {/* Spinning disc animation */}
          <div className="burning-progress__disc-container">
            {isComplete ? (
              <div className="burning-progress__checkmark">
                <svg viewBox="0 0 52 52" className="checkmark-svg">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            ) : (
              <div className="burning-progress__disc">
                <div className="burning-progress__disc-inner">
                  <div className="burning-progress__disc-hole"></div>
                </div>
                <div className="burning-progress__laser"></div>
              </div>
            )}
          </div>

          {/* File info */}
          {fileName && (
            <p className="burning-progress__file-name">{fileName}</p>
          )}

          {/* Progress info */}
          <p className="burning-progress__status">
            {isComplete ? 'Burn Complete!' : `Uploading file ${fileIndex + 1} of ${totalFiles}`}
          </p>

          {/* Progress bar */}
          <div className="burning-progress__bar-container">
            <div
              className="burning-progress__bar-fill"
              style={{ width: `${percentage}%` }}
            >
              <span className="burning-progress__bar-text">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>

          <p className="burning-progress__message">
            Please wait while your files are being uploaded...
          </p>
        </div>
      </div>
    </div>
  );
}
