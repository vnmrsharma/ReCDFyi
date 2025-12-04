/**
 * CD Metadata Service
 * Orchestrates AI metadata generation for CDs when they become public
 * Handles batch processing with progress tracking and error recovery
 */

import { generateBatchMetadata } from './aiService';
import { getFileMetadata, updateFileAIMetadata } from './fileService';
import { markAIMetadataGenerated } from './cdService';
import type { MediaFile } from '../types';

export interface MetadataGenerationProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'processing' | 'complete' | 'error';
  error?: string;
}

/**
 * Generates AI metadata for all files in a CD
 * Called when a CD is made public for the first time
 * @param cdId - ID of the CD to process
 * @param onProgress - Optional callback for progress updates
 * @returns Promise that resolves when all metadata is generated
 * @throws {Error} If metadata generation fails critically
 */
export async function generateCDMetadata(
  cdId: string,
  onProgress?: (progress: MetadataGenerationProgress) => void
): Promise<void> {
  console.log('[AI Metadata] Starting generation for CD:', cdId);
  
  try {
    // Fetch all files for this CD
    const files = await getFileMetadata(cdId);
    console.log('[AI Metadata] Found files:', files.length);
    
    if (files.length === 0) {
      console.log('[AI Metadata] No files to process, marking as complete');
      // No files to process, mark as complete
      await markAIMetadataGenerated(cdId);
      return;
    }
    
    // Report initial progress
    if (onProgress) {
      onProgress({
        current: 0,
        total: files.length,
        percentage: 0,
        status: 'processing',
      });
    }
    
    // Generate metadata for all files in batch
    console.log('[AI Metadata] Starting batch generation...');
    const metadataMap = await generateBatchMetadata(
      files,
      (current, total) => {
        console.log(`[AI Metadata] Progress: ${current}/${total}`);
        if (onProgress) {
          onProgress({
            current,
            total,
            percentage: Math.round((current / total) * 100),
            status: 'processing',
          });
        }
      }
    );
    
    // Update Firestore with generated metadata
    console.log('[AI Metadata] Updating Firestore with metadata...');
    await updateFilesWithMetadata(cdId, files, metadataMap);
    
    // Mark CD as having metadata generated
    console.log('[AI Metadata] Marking CD as complete');
    await markAIMetadataGenerated(cdId);
    
    // Report completion
    if (onProgress) {
      onProgress({
        current: files.length,
        total: files.length,
        percentage: 100,
        status: 'complete',
      });
    }
    
    console.log('[AI Metadata] Generation complete!');
  } catch (error: any) {
    console.error('[AI Metadata] Generation failed:', error);
    
    if (onProgress) {
      onProgress({
        current: 0,
        total: 0,
        percentage: 0,
        status: 'error',
        error: error.message,
      });
    }
    
    throw new Error(`Failed to generate CD metadata: ${error.message}`);
  }
}

/**
 * Updates all files with their generated AI metadata
 * Processes updates sequentially to avoid overwhelming Firestore
 */
async function updateFilesWithMetadata(
  cdId: string,
  files: MediaFile[],
  metadataMap: Map<string, any>
): Promise<void> {
  for (const file of files) {
    const metadata = metadataMap.get(file.id);
    
    if (metadata) {
      try {
        await updateFileAIMetadata(cdId, file.id, metadata);
      } catch (error) {
        console.error(`Failed to update metadata for file ${file.id}:`, error);
        // Continue with other files even if one fails
      }
    }
  }
}

/**
 * Checks if a CD needs metadata generation
 * @param cd - CD object to check
 * @returns true if metadata should be generated
 */
export function shouldGenerateMetadata(cd: { isPublic: boolean; aiMetadataGenerated?: boolean }): boolean {
  return cd.isPublic && !cd.aiMetadataGenerated;
}
