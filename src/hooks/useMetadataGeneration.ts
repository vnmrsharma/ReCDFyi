/**
 * Hook for managing AI metadata generation
 * Provides state and functions for generating metadata when CD becomes public
 */

import { useState, useCallback } from 'react';
import { generateCDMetadata, type MetadataGenerationProgress } from '../services/cdMetadataService';

interface UseMetadataGenerationResult {
  isGenerating: boolean;
  progress: MetadataGenerationProgress | null;
  error: string | null;
  generateMetadata: (cdId: string) => Promise<void>;
  reset: () => void;
}

export function useMetadataGeneration(): UseMetadataGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<MetadataGenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMetadata = useCallback(async (cdId: string) => {
    setIsGenerating(true);
    setError(null);
    setProgress(null);

    try {
      await generateCDMetadata(cdId, (progressUpdate) => {
        setProgress(progressUpdate);
        
        if (progressUpdate.status === 'error') {
          setError(progressUpdate.error || 'Metadata generation failed');
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generateMetadata,
    reset,
  };
}
