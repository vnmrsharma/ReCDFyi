/**
 * Search service for intelligent CD and file searching
 * Leverages AI-generated metadata for enhanced search capabilities
 */

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { PublicCD, MediaFile } from '../types';
import { COLLECTIONS } from '../utils/constants';

export interface SearchResult {
  cd: PublicCD;
  matchScore: number;
  matchedFiles: MediaFile[];
  matchReason: string;
}

/**
 * Searches public CDs using AI metadata for intelligent matching
 * @param searchQuery - Search query string
 * @returns Promise resolving to array of search results sorted by relevance
 */
export async function searchPublicCDsWithAI(searchQuery: string): Promise<SearchResult[]> {
  if (!searchQuery.trim()) {
    return [];
  }

  const lowerQuery = searchQuery.toLowerCase().trim();
  const queryTerms = lowerQuery.split(/\s+/);

  try {
    // Fetch all public CDs
    const publicCDsQuery = query(
      collection(db, COLLECTIONS.PUBLIC_CDS),
      orderBy('publicAt', 'desc')
    );
    const publicCDsSnapshot = await getDocs(publicCDsQuery);

    const results: SearchResult[] = [];

    // Process each public CD
    for (const cdDoc of publicCDsSnapshot.docs) {
      const cdData = cdDoc.data();
      const cd: PublicCD = {
        id: cdDoc.id,
        userId: cdData.userId,
        username: cdData.username,
        name: cdData.name,
        label: cdData.label,
        fileCount: cdData.fileCount || 0,
        createdAt: cdData.createdAt?.toDate() || new Date(),
        publicAt: cdData.publicAt?.toDate() || new Date(),
        viewCount: cdData.viewCount || 0,
        thumbnailUrl: cdData.thumbnailUrl,
      };

      // Fetch files with AI metadata for this CD
      const filesQuery = query(
        collection(db, COLLECTIONS.CDS, cdDoc.id, COLLECTIONS.FILES)
      );
      const filesSnapshot = await getDocs(filesQuery);

      const files: MediaFile[] = filesSnapshot.docs.map((fileDoc) => {
        const fileData = fileDoc.data();
        return {
          id: fileDoc.id,
          cdId: cdDoc.id,
          filename: fileData.filename,
          originalName: fileData.originalName,
          fileType: fileData.fileType,
          mimeType: fileData.mimeType,
          sizeBytes: fileData.sizeBytes,
          storagePath: fileData.storagePath,
          uploadedAt: fileData.uploadedAt?.toDate() || new Date(),
          thumbnailPath: fileData.thumbnailPath,
          aiMetadata: fileData.aiMetadata ? {
            description: fileData.aiMetadata.description,
            tags: fileData.aiMetadata.tags || [],
            category: fileData.aiMetadata.category,
            confidence: fileData.aiMetadata.confidence,
            generatedAt: fileData.aiMetadata.generatedAt?.toDate() || new Date(),
          } : undefined,
        };
      });

      // Calculate match score
      const matchResult = calculateMatchScore(cd, files, queryTerms);

      if (matchResult.score > 0) {
        results.push({
          cd,
          matchScore: matchResult.score,
          matchedFiles: matchResult.matchedFiles,
          matchReason: matchResult.reason,
        });
      }
    }

    // Sort by match score (highest first)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error: any) {
    console.error('Search failed:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Calculates match score for a CD based on search terms
 */
function calculateMatchScore(
  cd: PublicCD,
  files: MediaFile[],
  queryTerms: string[]
): { score: number; matchedFiles: MediaFile[]; reason: string } {
  let score = 0;
  const matchedFiles: MediaFile[] = [];
  const reasons: string[] = [];

  // Check CD name (highest weight)
  const cdNameLower = cd.name.toLowerCase();
  const cdNameMatches = queryTerms.filter((term) => cdNameLower.includes(term));
  if (cdNameMatches.length > 0) {
    score += cdNameMatches.length * 10;
    reasons.push('CD name');
  }

  // Check CD label
  if (cd.label) {
    const labelLower = cd.label.toLowerCase();
    const labelMatches = queryTerms.filter((term) => labelLower.includes(term));
    if (labelMatches.length > 0) {
      score += labelMatches.length * 5;
      reasons.push('CD description');
    }
  }

  // Check username
  const usernameLower = cd.username.toLowerCase();
  if (queryTerms.some((term) => usernameLower.includes(term))) {
    score += 3;
    reasons.push('creator');
  }

  // Check files with AI metadata
  for (const file of files) {
    let fileScore = 0;
    const fileReasons: string[] = [];

    // Check filename
    const filenameLower = file.originalName.toLowerCase();
    const filenameMatches = queryTerms.filter((term) => filenameLower.includes(term));
    if (filenameMatches.length > 0) {
      fileScore += filenameMatches.length * 3;
      fileReasons.push('filename');
    }

    // Check AI metadata if available
    if (file.aiMetadata) {
      // Check description
      const descLower = file.aiMetadata.description.toLowerCase();
      const descMatches = queryTerms.filter((term) => descLower.includes(term));
      if (descMatches.length > 0) {
        fileScore += descMatches.length * 7 * file.aiMetadata.confidence;
        fileReasons.push('AI description');
      }

      // Check tags
      const tagMatches = file.aiMetadata.tags.filter((tag) =>
        queryTerms.some((term) => tag.toLowerCase().includes(term))
      );
      if (tagMatches.length > 0) {
        fileScore += tagMatches.length * 8 * file.aiMetadata.confidence;
        fileReasons.push('AI tags');
      }

      // Check category
      if (queryTerms.some((term) => file.aiMetadata!.category.toLowerCase().includes(term))) {
        fileScore += 5 * file.aiMetadata.confidence;
        fileReasons.push('content type');
      }
    }

    if (fileScore > 0) {
      score += fileScore;
      matchedFiles.push(file);
    }
  }

  const reason = reasons.length > 0 ? `Matched: ${reasons.join(', ')}` : 'No matches';

  return { score, matchedFiles, reason };
}
