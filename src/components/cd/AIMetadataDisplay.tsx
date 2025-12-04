/**
 * Component to display AI-generated metadata for files
 * Shows tags and category in Y2K retro style
 */

import type { MediaFile } from '../../types';
import './AIMetadataDisplay.css';

interface AIMetadataDisplayProps {
  files: MediaFile[];
}

export function AIMetadataDisplay({ files }: AIMetadataDisplayProps) {
  // Filter files that have AI metadata
  const filesWithMetadata = files.filter(file => file.aiMetadata);

  if (filesWithMetadata.length === 0) {
    return null;
  }

  // Collect all unique tags across all files
  const allTags = new Set<string>();
  filesWithMetadata.forEach(file => {
    file.aiMetadata?.tags.forEach(tag => allTags.add(tag));
  });

  // Get most common category
  const categories = filesWithMetadata
    .map(f => f.aiMetadata?.category)
    .filter(Boolean);
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat!] = (acc[cat!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const primaryCategory = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  return (
    <div className="ai-metadata-container">
      <div className="ai-metadata-header">
        <span className="ai-badge">🤖 AI Enhanced</span>
        <span className="ai-subtitle">Smart metadata for better discovery</span>
      </div>

      <div className="ai-metadata-content">
        {/* Primary Category */}
        {primaryCategory && (
          <div className="ai-metadata-section">
            <h4 className="ai-section-title">CONTENT TYPE</h4>
            <div className="ai-category-badge">
              {getCategoryIcon(primaryCategory)} {primaryCategory}
            </div>
          </div>
        )}

        {/* Tags */}
        {allTags.size > 0 && (
          <div className="ai-metadata-section">
            <h4 className="ai-section-title">TAGS</h4>
            <div className="ai-tags-container">
              {Array.from(allTags).map(tag => (
                <span key={tag} className="ai-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    photo: '📷',
    music: '🎵',
    video: '🎬',
    art: '🎨',
    nature: '🌿',
    people: '👥',
    abstract: '✨',
    other: '📁',
  };
  return icons[category] || '📁';
}
