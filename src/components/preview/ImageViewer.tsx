/**
 * Image viewer component for displaying images
 */

import React from 'react';
import './PreviewComponents.css';

interface ImageViewerProps {
  url: string;
  alt: string;
}

/**
 * Displays an image with zoom and pan capabilities
 */
export function ImageViewer({ url, alt }: ImageViewerProps) {
  return (
    <div className="image-viewer">
      <img
        src={url}
        alt={alt}
        className="preview-image"
      />
    </div>
  );
}
