# Google Gemini API Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Choose **"Create API key in new project"** (or use existing project)
5. Copy the API key (starts with `AIza...`)

### Step 2: Add to Environment Variables

Open your `.env.local` file and add:

```bash
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace with your actual API key.

### Step 3: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

That's it! The feature is now enabled.

## Testing It Works

1. **Create a CD** and upload some files (images work best)
2. **Toggle it to public** using the switch
3. **Watch the progress modal** appear showing AI analysis
4. **Check Firestore** to see the generated metadata
5. **Try searching** for content in the marketplace

## Free Tier Limits

Google's free tier is generous:
- **15 requests per minute**
- **1,500 requests per day**
- **No credit card required**

For a typical CD with 10 files, that's:
- **150 CDs per day** on free tier
- More than enough for development and small deployments

## Cost Estimates (Paid Tier)

If you exceed free tier:
- **~$0.00001 per request** (Gemini 2.0 Flash)
- **~$0.0001 per CD** (10 files average)
- **$1 = 10,000 CDs** analyzed

Extremely affordable even at scale.

## Troubleshooting

### "API key not configured" error

**Problem**: `VITE_GEMINI_API_KEY` not set or incorrect

**Solution**:
1. Check `.env.local` file exists
2. Verify API key is correct (no extra spaces)
3. Restart dev server
4. Clear browser cache

### "Failed to generate metadata" errors

**Problem**: Rate limit exceeded or API error

**Solution**:
1. Check [API quota](https://aistudio.google.com/app/apikey) usage
2. Wait a minute and try again
3. Reduce number of files per CD
4. Check browser console for specific error

### Metadata not appearing in search

**Problem**: Generation still in progress or failed

**Solution**:
1. Wait for progress modal to complete
2. Check Firestore for `aiMetadata` field on files
3. Verify CD has `aiMetadataGenerated: true`
4. Try regenerating (future feature)

### API key exposed in browser

**Problem**: Concerned about API key visibility

**Solution**:
- This is normal for Gemini API (designed for client-side use)
- Use API key restrictions in Google Cloud Console
- Restrict to your domain only
- Monitor usage regularly
- Rotate key if compromised

## API Key Security

### Restrict Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click **"Edit"**
4. Under **"Application restrictions"**:
   - Choose **"HTTP referrers"**
   - Add your domains:
     - `http://localhost:5173/*` (development)
     - `https://your-app.vercel.app/*` (production)
5. Under **"API restrictions"**:
   - Choose **"Restrict key"**
   - Select **"Generative Language API"**
6. Click **"Save"**

### Monitor Usage

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. View your API key
3. Check **"Usage"** tab
4. Set up alerts for unusual activity

### Rotate If Compromised

If your API key is exposed:
1. Create a new API key
2. Update `.env.local` with new key
3. Delete old key from Google Cloud Console
4. Redeploy your app

## Production Deployment

### Vercel

Add environment variable in Vercel dashboard:

```
VITE_GEMINI_API_KEY = AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Other Platforms

Add to your platform's environment variables:
- Netlify: Site settings → Environment variables
- Railway: Project → Variables
- Render: Environment → Environment Variables

## Disabling the Feature

To disable AI metadata generation:

1. Remove `VITE_GEMINI_API_KEY` from `.env.local`
2. Restart dev server
3. Feature automatically disabled
4. No code changes needed

Or set to empty string:

```bash
VITE_GEMINI_API_KEY=
```

## Advanced Configuration

### Adjust Rate Limiting

Edit `src/utils/constants.ts`:

```typescript
export const AI_METADATA_SETTINGS = {
  BATCH_DELAY_MS: 100,      // Increase to slow down (avoid rate limits)
  MAX_RETRIES: 2,           // Increase for better reliability
  TIMEOUT_MS: 10000,        // Increase for slow connections
};
```

### Custom Prompts

Edit `src/services/aiService.ts` → `buildPromptForFileType()`:

```typescript
function buildPromptForFileType(fileType: string, filename: string): string {
  // Customize prompts here
  return `Your custom prompt...`;
}
```

### Fallback Metadata

Edit `src/services/aiService.ts` → `createFallbackMetadata()`:

```typescript
function createFallbackMetadata(file: MediaFile): AIMetadata {
  // Customize fallback logic here
}
```

## FAQ

**Q: Is the API key safe to use client-side?**
A: Yes, Gemini API is designed for client-side use. Restrict it to your domain for security.

**Q: What happens if I exceed the free tier?**
A: Requests will fail. Enable billing in Google Cloud Console to continue.

**Q: Can I use a different AI model?**
A: Yes, edit `GEMINI_API_URL` in `aiService.ts` to use different models.

**Q: Does this work offline?**
A: No, requires internet connection to call Gemini API.

**Q: Can I regenerate metadata?**
A: Not yet, but it's on the roadmap. For now, toggle CD to private then public again.

**Q: What data is sent to Google?**
A: Only file content (images as base64) and filenames. No user data or PII.

## Support

Need help?
- Check [Google AI Studio docs](https://ai.google.dev/docs)
- Open an issue on GitHub
- Check browser console for errors
- Review `docs/AI_METADATA_FEATURE.md` for technical details

## Next Steps

Once you have it working:
1. Test with various file types
2. Try searching with AI-generated tags
3. Monitor API usage
4. Set up domain restrictions
5. Deploy to production

Happy burning! 💿🤖
