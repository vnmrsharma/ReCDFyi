# Username Migration Fix - Public CD Toggle Error

## Problem
When existing users (who signed up before the username feature) tried to make a CD public, they encountered this error:

```
FirebaseError: Function setDoc() called with invalid data. 
Unsupported field value: undefined (found in field username in document publicCDs/...)
```

## Root Cause
The `toggleCDPublic` function in `publicCDService.ts` was trying to sync CD data to the `publicCDs` collection, including the `username` field. For existing users who haven't set a username yet, this field was `undefined`, causing Firestore to reject the write operation.

## Solution
Added a validation check in `toggleCDPublic` to prevent users from making CDs public if they don't have a username set:

```typescript
// Check if user has a username (required for public CDs)
if (isPublic && !cdData.username) {
  throw new Error('You must set a username before making CDs public. Please complete your profile setup.');
}
```

## User Flow

### For Existing Users Without Username:
1. User logs in → UsernamePromptModal appears (from migration system)
2. User tries to make CD public → Clear error message shown
3. User sets username via the modal → All existing CDs are updated with username
4. User can now successfully make CDs public

### For New Users:
- Username is required during signup
- No issues making CDs public

## Files Modified
- `src/services/publicCDService.ts` - Added username validation check

## Related Systems
- **UsernamePromptModal** - Prompts users to set username on login
- **setUsernameDuringMigration** - Updates all user's CDs with new username
- **PublicToggle** - Already has error handling to display the message

## Testing
The error is now caught gracefully and displays a user-friendly message:
- "You must set a username before making CDs public. Please complete your profile setup."

## Prevention
This validation ensures:
- No undefined values are written to Firestore
- Users are guided to complete profile setup
- Data integrity is maintained in the publicCDs collection
- Clear user feedback about what action is needed
