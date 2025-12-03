/**
 * Utility for generating zip archives of CD files
 */

import JSZip from 'jszip';
import { getFileDownloadURL } from '../services/fileService';
import type { MediaFile } from '../types';

/**
 * Generates a zip archive containing all files from a CD
 * @param files - Array of MediaFile objects to include in the zip
 * @returns Promise resolving to a Blob containing the zip archive
 * @throws {Error} If zip generation fails
 */
export async function generateZipDownload(files: MediaFile[]): Promise<Blob> {
  try {
    const zip = new JSZip();

    // Download all files and add to zip
    const downloadPromises = files.map(async (file) => {
      try {
        // Get download URL
        const downloadURL = await getFileDownloadURL(file.storagePath);
        
        // Fetch file content
        const response = await fetch(downloadURL);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file.originalName}`);
        }
        
        const blob = await response.blob();
        
        // Add to zip with original filename
        zip.file(file.originalName, blob);
      } catch (error: any) {
        console.error(`Failed to add ${file.originalName} to zip:`, error);
        // Continue with other files even if one fails
      }
    });

    // Wait for all files to be added
    await Promise.all(downloadPromises);

    // Generate zip blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Balanced compression
      },
    });

    return zipBlob;
  } catch (error: any) {
    throw new Error(`Failed to generate zip: ${error.message}`);
  }
}
