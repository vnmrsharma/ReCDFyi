# Firestore Rules Fix - PublicCDs Permission Error

## Problem
When trying to make a CD private (removing it from the marketplace), you got this error:
```
Error removing public CD: FirebaseError: Missing or insufficient permissions.
```

## Root Cause
The Firestore security rules for the `publicCDs` collection had:
```javascript
allow write: if false; // Only via backend/cloud functions
```

This blocked ALL write operations from the client, including deletions by the CD owner.

## Solution
Updated the `publicCDs` collection rules to allow the CD owner to manage their public CD entries:

```javascript
// PublicCDs collection - denormalized for marketplace performance
match /publicCDs/{cdId} {
  allow read: if true; // Anyone can browse marketplace
  // Allow CD owner to create/update/delete their public CD entries
  allow write: if isAuthenticated() 
    && exists(/databases/$(database)/documents/cds/$(cdId))
    && isOwner(get(/databases/$(database)/documents/cds/$(cdId)).data.userId);
}
```

This rule now:
1. Checks if the user is authenticated
2. Verifies the CD exists in the main `cds` collection
3. Confirms the authenticated user is the owner of that CD
4. Allows create, update, and delete operations

## How to Deploy

### Option 1: Firebase Console (Easiest)
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database → Rules
4. Copy the updated rules from `firestore.rules`
5. Click "Publish"

### Option 2: Firebase CLI
```bash
# First, set your active project
firebase use --add

# Then deploy the rules
firebase deploy --only firestore:rules
```

## Testing
After deploying the rules, you should be able to:
- ✅ Make your CDs public (creates entry in publicCDs)
- ✅ Make your CDs private (deletes entry from publicCDs)
- ✅ Browse marketplace (read publicCDs)
- ❌ Modify other users' public CD entries (blocked)

## Files Modified
- `firestore.rules` - Updated publicCDs collection rules

## Security Considerations
The new rule is secure because:
- Only authenticated users can write
- Users can only modify their own CDs
- Ownership is verified against the main `cds` collection
- Public read access is maintained for marketplace browsing
