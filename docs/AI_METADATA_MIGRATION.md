# AI Metadata Migration Guide

## For Existing ReCd Deployments

If you already have ReCd deployed and want to add AI metadata generation, follow this guide.

## Prerequisites

- Existing ReCd deployment
- Access to environment variables
- Google account for Gemini API

## Migration Steps

### 1. Update Codebase

Pull the latest changes:

```bash
git pull origin main
npm install
```

### 2. Get Gemini API Key

Follow [GEMINI_SETUP_GUIDE.md](GEMINI_SETUP_GUIDE.md) to get your API key.

### 3. Update Environment Variables

**Local Development:**
```bash
# Add to .env.local
VITE_GEMINI_API_KEY=your_api_key_here
```

**Production (Vercel):**
1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `VITE_GEMINI_API_KEY` = `your_api_key_here`
5. Redeploy

**Production (Other Platforms):**
- Netlify: Site settings → Environment variables
- Railway: Project → Variables
- Render: Environment → Environment Variables

### 4. Test Locally

```bash
npm run dev
```

1. Create a test CD
2. Upload some files
3. Toggle to public
4. Verify progress modal appears
5. Check Firestore for `aiMetadata` field

### 5. Deploy to Production

```bash
# Build and test
npm run build
npm run preview

# Deploy
vercel --prod
# or your deployment command
```

### 6. Verify Production

1. Visit your production site
2. Make a CD public
3. Check that metadata generation works
4. Test search functionality

## Existing Data

### What Happens to Existing Public CDs?

**Existing public CDs will NOT automatically get AI metadata.**

They will continue to work normally, but won't benefit from enhanced search until:
1. User toggles them to private, then back to public
2. You implement batch regeneration (future feature)
3. User creates new public CDs

### Manual Regeneration (Optional)

If you want to regenerate metadata for existing public CDs:

**Option 1: User Action**
- Users can toggle CDs to private, then back to public
- This triggers metadata generation

**Option 2: Batch Script (Future)**
- We'll add a batch regeneration feature
- Will process all public CDs at once
- Coming in a future update

**Option 3: Custom Script**
```typescript
// Example script (not included, for reference)
import { generateCDMetadata } from './src/services/cdMetadataService';

async function regenerateAllPublicCDs() {
  // Fetch all public CDs
  // For each CD:
  //   - Check if aiMetadataGenerated is false
  //   - Call generateCDMetadata(cdId)
  //   - Wait between CDs to avoid rate limits
}
```

## Database Schema Changes

### New Fields Added

**CD Collection:**
```typescript
{
  // ... existing fields
  aiMetadataGenerated?: boolean;
  aiMetadataGeneratedAt?: Timestamp;
}
```

**Files Subcollection:**
```typescript
{
  // ... existing fields
  aiMetadata?: {
    description: string;
    tags: string[];
    category: string;
    confidence: number;
    generatedAt: Timestamp;
  }
}
```

### Backward Compatibility

✅ **Fully backward compatible**
- New fields are optional
- Existing CDs work without changes
- No data migration required
- Old clients can still read data

## Firestore Security Rules

No changes needed! Existing rules already allow:
- CD owners to update their CDs
- CD owners to update file metadata

The new fields are covered by existing rules.

## Cost Considerations

### Free Tier
- 15 requests/minute
- 1,500 requests/day
- Sufficient for small deployments

### Paid Tier
- ~$0.0001 per CD (10 files)
- $1 = 10,000 CDs analyzed
- Very affordable at scale

### Monitoring Usage

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Check usage dashboard
3. Set up billing alerts if needed

## Rollback Plan

If you need to disable the feature:

### Quick Disable
```bash
# Remove from .env.local
# VITE_GEMINI_API_KEY=

# Redeploy
vercel --prod
```

### Full Rollback
```bash
# Revert to previous commit
git revert HEAD

# Redeploy
npm install
npm run build
vercel --prod
```

Existing metadata remains in database but won't be generated for new CDs.

## Testing Checklist

Before deploying to production:

- [ ] API key configured locally
- [ ] Metadata generation works locally
- [ ] Progress modal displays correctly
- [ ] Firestore updates with metadata
- [ ] Search works with AI metadata
- [ ] Fallback works when API fails
- [ ] API key configured in production
- [ ] Production deployment successful
- [ ] Metadata generation works in production
- [ ] No console errors
- [ ] API usage monitored

## Troubleshooting

### "API key not configured" in production

**Problem**: Environment variable not set

**Solution**:
1. Check platform environment variables
2. Verify variable name is exact: `VITE_GEMINI_API_KEY`
3. Redeploy after adding variable
4. Clear CDN cache if applicable

### Metadata not generating

**Problem**: API errors or rate limits

**Solution**:
1. Check browser console for errors
2. Verify API key is valid
3. Check Google Cloud Console for quota
4. Wait and try again (rate limit)

### Search not finding AI-tagged content

**Problem**: Metadata not indexed or search not updated

**Solution**:
1. Verify `aiMetadata` exists in Firestore
2. Check CD has `aiMetadataGenerated: true`
3. Clear browser cache
4. Try different search terms

## Performance Impact

### Expected Impact
- **CD Publication**: No change (async generation)
- **Search**: Slightly slower (more data to process)
- **Storage**: +1-2KB per file (metadata)
- **API Calls**: +1 per file when making CD public

### Optimization Tips
1. Use rate limiting (already implemented)
2. Monitor API usage regularly
3. Consider caching search results (future)
4. Batch regeneration during off-peak hours

## Support

Need help with migration?
- Review [AI_METADATA_FEATURE.md](AI_METADATA_FEATURE.md)
- Check [GEMINI_SETUP_GUIDE.md](GEMINI_SETUP_GUIDE.md)
- Open an issue on GitHub
- Check browser console for errors

## Next Steps

After successful migration:
1. ✅ Monitor API usage
2. ✅ Test search functionality
3. ✅ Gather user feedback
4. ✅ Consider batch regeneration for old CDs
5. ✅ Set up API key restrictions
6. ✅ Enable billing alerts

Enjoy the enhanced search! 🔍🤖
