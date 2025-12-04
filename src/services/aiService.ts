/**
 * AI service for intelligent metadata generation using Google Gemini
 * Generates metadata only for public CDs to optimize costs and privacy
 */

import type { MediaFile, AIMetadata } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Generates AI metadata for a media file
 * @param file - MediaFile to analyze
 * @returns Promise resolving to AIMetadata
 * @throws {Error} If API call fails or file cannot be analyzed
 */
export async function generateFileMetadata(file: MediaFile): Promise<AIMetadata> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // For now, we'll use filename-based analysis for all file types
    // Image analysis with actual content requires server-side processing due to CORS
    const prompt = buildPromptForFileType(file.fileType, file.originalName);
    
    // Call Gemini API with text-only prompt
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the response into structured metadata
    return parseAIResponse(generatedText, file.fileType);
  } catch (error: any) {
    console.error('AI metadata generation failed:', error);
    // Return fallback metadata instead of throwing
    return createFallbackMetadata(file);
  }
}

/**
 * Generates AI metadata for multiple files in batch
 * Processes files sequentially to avoid rate limits
 * @param files - Array of MediaFiles to analyze
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to Map of fileId to AIMetadata
 */
export async function generateBatchMetadata(
  files: MediaFile[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, AIMetadata>> {
  const metadataMap = new Map<string, AIMetadata>();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const metadata = await generateFileMetadata(file);
      metadataMap.set(file.id, metadata);
    } catch (error) {
      console.error(`Failed to generate metadata for ${file.originalName}:`, error);
      // Use fallback for failed files
      metadataMap.set(file.id, createFallbackMetadata(file));
    }
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
    
    // Small delay to avoid rate limiting (100ms between requests)
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return metadataMap;
}

/**
 * Builds appropriate prompt based on file type
 */
function buildPromptForFileType(fileType: string, filename: string): string {
  const basePrompt = `Analyze this ${fileType} file named "${filename}". Based on the filename, provide:
1. A brief description (max 50 words) - infer content from the filename
2. 3-5 relevant tags (comma-separated) - extract keywords from filename and infer related concepts
3. Content category (one of: photo, music, video, art, nature, people, abstract, other)

Format your response as:
DESCRIPTION: [description]
TAGS: [tag1, tag2, tag3]
CATEGORY: [category]`;

  switch (fileType) {
    case 'image':
      return `${basePrompt}\n\nFor images, infer what the photo might contain based on the filename. Look for keywords like 'sunset', 'beach', 'portrait', 'landscape', etc.`;
    case 'audio':
      return `${basePrompt}\n\nFor audio, identify genre, mood, and style from the filename. Look for artist names, song titles, or descriptive words.`;
    case 'video':
      return `${basePrompt}\n\nFor video, identify content type and subject matter from the filename. Look for event names, locations, or descriptive terms.`;
    default:
      return basePrompt;
  }
}

/**
 * Parses AI response text into structured metadata
 */
function parseAIResponse(text: string, fileType: string): AIMetadata {
  const lines = text.split('\n').filter(line => line.trim());
  
  let description = '';
  let tags: string[] = [];
  let category = 'other';
  
  for (const line of lines) {
    if (line.startsWith('DESCRIPTION:')) {
      description = line.replace('DESCRIPTION:', '').trim();
    } else if (line.startsWith('TAGS:')) {
      const tagString = line.replace('TAGS:', '').trim();
      tags = tagString.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    } else if (line.startsWith('CATEGORY:')) {
      category = line.replace('CATEGORY:', '').trim().toLowerCase();
    }
  }
  
  return {
    description: description || `A ${fileType} file`,
    tags: tags.length > 0 ? tags : [fileType],
    category: category as AIMetadata['category'],
    confidence: 0.8,
    generatedAt: new Date(),
  };
}

/**
 * Creates fallback metadata when AI generation fails
 */
function createFallbackMetadata(file: MediaFile): AIMetadata {
  const fileNameWithoutExt = file.originalName.replace(/\.[^/.]+$/, '');
  
  return {
    description: `${file.fileType} file: ${fileNameWithoutExt}`,
    tags: [file.fileType, fileNameWithoutExt.toLowerCase()],
    category: file.fileType === 'image' ? 'photo' : file.fileType === 'audio' ? 'music' : 'video',
    confidence: 0.3,
    generatedAt: new Date(),
  };
}
