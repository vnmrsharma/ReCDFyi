# Known Issues

This document tracks known issues and technical debt in the codebase.

## Linting Warnings

### TypeScript `any` Types

Several files use `any` type for error handling:
- `src/components/auth/LoginForm.tsx` (line 59)
- `src/components/auth/PasswordResetForm.tsx` (line 53)
- `src/components/auth/SignUpForm.tsx` (line 145)
- `src/components/auth/UsernamePromptModal.tsx` (line 88)
- `src/components/cd/CDDetailView.tsx` (line 45)
- `src/components/cd/CreateCDModal.tsx` (line 54)
- `src/components/cd/FileList.tsx` (lines 39, 63)
- `src/components/cd/PublicToggle.tsx` (line 50)
- `src/components/cd/ViewAnalytics.tsx` (line 40)
- `src/components/preview/FilePreviewModal.tsx` (line 36)
- `src/components/share/SharedCDView.tsx` (line 58)

**Reason:** Firebase and browser APIs return errors with dynamic types. Using `any` for error handling is acceptable in catch blocks.

**Impact:** Low - errors are properly handled and logged

**Future Fix:** Create typed error interfaces for common error patterns

### React Hooks Dependencies

Several components have missing dependencies in useEffect:
- `src/components/cd/CDDetailView.tsx` - missing `loadFiles`
- `src/components/cd/ViewAnalytics.tsx` - missing `loadAnalytics`
- `src/components/preview/FilePreviewModal.tsx` - missing `loadFileURL`, `handleKeyDown`
- `src/components/share/ShareModal.tsx` - missing `generateShareLink`, `shareUrl`
- `src/components/share/SharedCDView.tsx` - missing `loadSharedCD`

**Reason:** These functions are intentionally excluded to prevent infinite loops. They're stable functions that don't need to trigger re-renders.

**Impact:** None - behavior is correct

**Future Fix:** Wrap functions in useCallback or add eslint-disable comments with explanations

### Unused Variables

- `src/components/auth/SignUpForm.tsx` - `username` (line 60), `error` (line 136)
- `src/components/cd/FileList.tsx` - `onFileDeleted` (line 22), `readOnly` (line 65)

**Reason:** These are destructured from props but not used in current implementation

**Impact:** None - just unused code

**Future Fix:** Remove unused destructured variables or use them

### TypeScript Build Warnings

Several files have unused imports or type import issues:
- Unused `React` imports in several components (React 19 doesn't require explicit import)
- Type imports should use `import type` syntax
- Unused destructured variables

**Reason:** React 19 automatic JSX transform makes React import unnecessary. TypeScript strict settings flag these.

**Impact:** None - code works correctly, just warnings

**Future Fix:** Remove unused React imports and use `import type` for type-only imports

## Non-Critical Issues

### Email Service Configuration

The email service uses EmailJS which requires external configuration. Users must:
1. Create EmailJS account
2. Configure email service
3. Create email template
4. Add credentials to `.env.local`

**Impact:** Email sharing won't work without proper EmailJS setup

**Documentation:** Covered in SETUP.md

### Firebase Emulator Requirement for Tests

Tests require Firebase Emulators to be running:
```bash
firebase emulators:start
```

**Impact:** Tests will fail if emulators aren't running

**Documentation:** Covered in SETUP.md and test README files

### Storage Bucket URL Format

Firebase Storage bucket URL format changed from `.appspot.com` to `.firebasestorage.app`. Older projects may use the old format.

**Impact:** None - both formats work

**Documentation:** `.env.example` uses new format

## Performance Considerations

### Large File Uploads

Files are uploaded directly to Firebase Storage. Very large files (close to 20MB) may take time to upload on slow connections.

**Impact:** User experience may be slow on poor connections

**Future Enhancement:** Add chunked upload or progress optimization

### Marketplace Pagination

Marketplace loads 20 CDs at a time with infinite scroll. Very large collections may have performance issues.

**Impact:** Minimal - most users won't have thousands of public CDs

**Future Enhancement:** Implement virtual scrolling for very large lists

### Image Preview Generation

Thumbnails are not pre-generated. Images are loaded at full size then scaled by CSS.

**Impact:** Slightly slower initial load for image-heavy CDs

**Future Enhancement:** Generate thumbnails on upload

## Security Considerations

### Share Token Expiration

Share tokens expire after 30 days but are not automatically cleaned up from Firestore.

**Impact:** Database accumulates expired tokens

**Future Enhancement:** Add Cloud Function to clean up expired tokens

### Rate Limiting

No rate limiting on client side. Firebase Security Rules provide some protection but aggressive users could make many requests.

**Impact:** Potential for abuse

**Future Enhancement:** Implement client-side rate limiting and Firebase App Check

## Browser Compatibility

### Tested Browsers

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

### Known Issues

- **Safari < 16**: May have issues with some CSS features
- **IE 11**: Not supported (uses modern JavaScript features)
- **Mobile browsers**: Fully supported

## Accessibility

### Current Status

- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG AA
- ✅ Reduced motion support

### Areas for Improvement

- Focus indicators could be more prominent
- Some ARIA labels could be more descriptive
- Skip links not implemented

## Testing Coverage

### Current Coverage

- Unit tests: ~70%
- Property tests: Core business logic
- Integration tests: Main user flows
- Security rules: Comprehensive

### Areas Needing More Tests

- Error boundary edge cases
- Complex user interactions
- Mobile-specific behaviors
- Offline functionality

## Documentation

### Complete

- ✅ README.md
- ✅ SETUP.md
- ✅ CONTRIBUTING.md
- ✅ API documentation in code
- ✅ Implementation notes

### Could Be Improved

- Architecture diagrams could be more detailed
- Component interaction flows
- State management documentation
- Deployment troubleshooting guide

## Future Enhancements

### Planned

- [ ] Offline support with service workers
- [ ] Progressive Web App (PWA) features
- [ ] Dark mode theme
- [ ] More Y2K themes (Windows XP, Mac OS 9, etc.)
- [ ] CD cover art customization
- [ ] Audio player with playlist
- [ ] Social features (likes, comments)

### Under Consideration

- [ ] Mobile apps (React Native)
- [ ] Desktop app (Electron)
- [ ] Browser extension
- [ ] API for third-party integrations
- [ ] Premium features (more storage, custom domains)

## Contributing

If you'd like to help fix any of these issues:

1. Check if there's an existing issue on GitHub
2. If not, create one referencing this document
3. Fork the repository
4. Make your changes
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

**Last Updated:** December 3, 2024

**Note:** This is a living document. Issues will be added/removed as the project evolves.
