/**
 * Audio player component for playing audio files
 */

import React from 'react';
import './PreviewComponents.css';

interface AudioPlayerProps {
  url: string;
  filename: string;
}

/**
 * Displays an audio player with controls
 */
export function AudioPlayer({ url, filename }: AudioPlayerProps) {
  return (
    <div className="audio-player">
      <div className="audio-icon">
        🎵
      </div>
      <p className="audio-filename">{filename}</p>
      <audio
        controls
        className="audio-controls"
        src={url}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
