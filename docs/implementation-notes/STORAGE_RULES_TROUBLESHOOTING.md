# Storage Rules Troubleshooting

## Issue
Users cannot access files in public CDs, getting "storage/unauthorized" error.

## What We Fixed
Updated `storage.rules` to allow public read access for files in public CDs:

```javascript
function isCDPublic(cdId) {
  return firestore.exists(/databases/(default)/documents/cds/$(cdId)) &&
         firestore.get(/databases/(default)/documents/cds/$(cdId)).data.isPublic == true;
}

// Allow read if: owner, OR CD is public
allow read: if isOwner(userId) || isCDPublic(cdId);
```

## Deployed
Rules were successfully deployed to Firebase Storage.

## Troubleshooting Steps

### 1. Verify CD is Actually Public in Firestore
Check in Firebase Console:
- Go to Firestore Database
- Navigate to `cds/{cdId}`
- Verify the document has `isPublic: true`

### 2. Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or clear browser cache completely

### 3. Wait for Rules Propagation
Firebase rules can take a few minutes to propagate globally. Wait 2-3 minutes and try again.

### 4. Check Firebase Console Rules
Verify the rules are actually deployed:
- Go to Firebase Console → Storage → Rules
- Check that the rules match what's in `storage.rules`

### 5. Test with Firebase Emulator
If still not working, test locally with emulator:
```bash
firebase emulators:start
```

## Alternative: Temporary Public Access
If you need immediate access for testing, you can temporarily make all files public:

```javascript
// TEMPORARY - DO NOT USE IN PRODUCTION
match /users/{userId}/cds/{cdId}/files/{fileId} {
  allow read: if true; // Allow all reads
  allow write: if isOwner(userId) && isValidFileType() && isValidFileSize();
  allow delete: if isOwner(userId);
}
```

**WARNING**: This allows anyone to access ANY file, even private ones. Only use for testing!

## Expected Behavior After Fix
- ✅ CD owner can always access their files
- ✅ Anyone can access files in public CDs (isPublic: true)
- ❌ Non-owners cannot access files in private CDs (isPublic: false)
- ✅ Guest users (not logged in) can access public CD files
