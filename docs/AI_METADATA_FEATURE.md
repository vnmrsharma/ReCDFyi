# AI Metadata Generation Feature

## Overview

The ReCd platform now includes intelligent metadata generation powered by Google Gemini 2.0 Flash. This feature automatically analyzes files when a CD is made public, generating smart metadata to enhance search and discovery.

## Key Features

- **Privacy-First**: Metadata generation only occurs when a CD is made public
- **Non-Blocking**: Generation happens asynchronously without blocking the UI
- **Intelligent Search**: AI-generated tags, descriptions, and categories improve search accuracy
- **Cost-Optimized**: Only processes public CDs, minimizing API costs
- **Graceful Degradation**: Falls back to basic metadata if AI generation fails

## Architecture

### Services

1. **aiService.ts**: Core AI integration with Gemini API
   - Generates metadata for individual files
   - Batch processing with rate limiting
   - Handles image analysis with base64 encoding
   - Fallback metadata for failures

2. **cdMetadataService.ts**: Orchestration layer
   - Manages batch metadata generation for entire CDs
   - Progress tracking and error recovery
   - Updates Firestore with generated metadata

3. **searchService.ts**: Enhanced search capabilities
   - Leverages AI metadata for intelligent matching
   - Weighted scoring system (CD name > AI tags > descriptions)
   - Returns ranked results with match reasons

### Data Model

```typescript
interface AIMetadata {
  description: string;        // Brief description (max 50 words)
  tags: string[];            // 3-5 relevant tags
  category: string;          // Content category
  confidence: number;        // AI confidence score (0-1)
  generatedAt: Date;        // Generation timestamp
}

interface MediaFile {
  // ... existing fields
  aiMetadata?: AIMetadata;
}

interface CD {
  // ... existing fields
  aiMetadataGenerated?: boolean;
  aiMetadataGeneratedAt?: Date;
}
```

## User Flow

1. User creates a CD and uploads files (private by default)
2. User toggles CD to public
3. Confirmation modal explains metadata generation
4. CD visibility updates immediately
5. Metadata generation starts asynchronously
6. Progress modal shows analysis status
7. Files are analyzed one by one (100ms delay between calls)
8. Metadata stored in Firestore
9. CD marked as `aiMetadataGenerated: true`
10. Enhanced search now available for this CD

## Configuration

### Environment Variables

```bash
# Required for AI metadata generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

### Constants

```typescript
// src/utils/constants.ts
export const AI_METADATA_SETTINGS = {
  BATCH_DELAY_MS: 100,      // Delay between API calls
  MAX_RETRIES: 2,           // Retries for failed generation
  TIMEOUT_MS: 10000,        // Timeout per file
};
```

## API Usage

### Gemini 2.0 Flash Endpoint

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

**Request Format:**
```json
{
  "contents": [{
    "parts": [
      { "text": "Analyze this image..." },
      { "inline_data": { "mime_type": "image/jpeg", "data": "base64..." } }
    ]
  }],
  "generationConfig": {
    "temperature": 0.4,
    "topK": 32,
    "topP": 1,
    "maxOutputTokens": 200
  }
}
```

**Response Format:**
```
DESCRIPTION: A sunset photo with vibrant orange and pink colors
TAGS: sunset, nature, landscape, sky, evening
CATEGORY: photo
```

## Performance Considerations

### Latency Optimization

- **Async Processing**: Metadata generation doesn't block CD publication
- **Batch Processing**: Files processed sequentially with minimal delays
- **Progress Feedback**: Real-time progress updates keep users informed
- **Early Exit**: Modal auto-closes on completion

### Cost Optimization

- **Public Only**: Only processes public CDs (user opt-in)
- **One-Time Generation**: Metadata generated once per CD
- **Rate Limiting**: 100ms delay between API calls prevents rate limit errors
- **Fallback Metadata**: Failed generations use filename-based metadata

### API Costs (Gemini 2.0 Flash)

- **Free Tier**: 15 requests per minute, 1500 per day
- **Paid Tier**: Very low cost (~$0.00001 per request)
- **Average CD**: 5-10 files = $0.0001 per CD

## Error Handling

### Graceful Degradation

1. **API Key Missing**: Feature disabled, no metadata generated
2. **API Error**: Falls back to filename-based metadata
3. **Network Error**: Retries with exponential backoff
4. **Timeout**: Uses fallback metadata after 10 seconds
5. **Partial Failure**: Continues with remaining files

### User Experience

- Errors don't prevent CD from becoming public
- Progress modal shows error state but allows continuation
- Failed files get basic metadata (filename + file type)
- Users can retry metadata generation later (future feature)

## Search Enhancement

### Weighted Scoring System

```
CD Name Match:        10 points per term
CD Label Match:       5 points per term
AI Description:       7 points × confidence
AI Tags:              8 points × confidence
AI Category:          5 points × confidence
Username Match:       3 points
Filename Match:       3 points per term
```

### Search Example

Query: "sunset beach"

**High Score Match:**
- CD Name: "Beach Vacation 2024"
- File with AI tags: ["sunset", "beach", "ocean"]
- AI description: "Beautiful sunset over the beach"
- Score: 10 + 8 + 8 + 7 = 33 points

**Low Score Match:**
- CD Name: "Random Photos"
- Filename: "IMG_1234.jpg"
- No AI metadata
- Score: 0 points

## Testing

### Manual Testing

1. Create a CD with various file types (images, audio, video)
2. Toggle CD to public
3. Verify progress modal appears
4. Check Firestore for generated metadata
5. Test search with AI-generated tags
6. Verify fallback for failed generations

### Integration Testing

```bash
# Test with Firebase emulator
npm run test:integration
```

## Future Enhancements

1. **Retry Mechanism**: Allow users to regenerate metadata
2. **Manual Editing**: Let users edit AI-generated metadata
3. **Vector Search**: Use embeddings for semantic search
4. **Batch Regeneration**: Regenerate metadata for all public CDs
5. **Analytics**: Track metadata quality and search effectiveness
6. **Multi-Language**: Support metadata in multiple languages

## Security Considerations

- API key stored in environment variables (never committed)
- Only CD owners can trigger metadata generation
- Firestore rules prevent unauthorized metadata updates
- Rate limiting prevents API abuse
- No PII in generated metadata

## Monitoring

### Key Metrics

- Metadata generation success rate
- Average generation time per file
- API error rate
- Search result quality (click-through rate)
- Cost per CD

### Logging

```typescript
// Success
console.log('Metadata generated for CD:', cdId);

// Failure
console.error('Metadata generation failed:', error);

// Fallback
console.warn('Using fallback metadata for file:', fileId);
```

## Troubleshooting

### Common Issues

**Issue**: Metadata not generating
- Check `VITE_GEMINI_API_KEY` is set
- Verify API key is valid
- Check browser console for errors

**Issue**: Slow generation
- Normal for large CDs (10+ files)
- Each file takes 1-2 seconds
- Progress modal shows status

**Issue**: Poor search results
- Metadata may need time to generate
- Try more specific search terms
- Check if CD has `aiMetadataGenerated: true`

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Gemini 2.0 Flash Model](https://ai.google.dev/models/gemini)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
