/**
 * Video player component for playing video files
 */

import React from 'react';
import './PreviewComponents.css';

interface VideoPlayerProps {
  url: string;
  filename: string;
}

/**
 * Displays a video player with controls
 */
export function VideoPlayer({ url, filename }: VideoPlayerProps) {
  return (
    <div className="video-player">
      <video
        controls
        className="video-controls"
        src={url}
      >
        Your browser does not support the video element.
      </video>
      <p className="video-filename">{filename}</p>
    </div>
  );
}
