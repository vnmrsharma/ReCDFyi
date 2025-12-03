# Implementation Plan

- [x] 1. Project setup and Firebase configuration
  - Initialize React project with Vite and TypeScript
  - Install dependencies (React Router, Firebase SDK, fast-check for testing)
  - Create Firebase project and configure authentication, Firestore, and Storage
  - Set up Firebase configuration file with environment variables
  - Configure Firebase Emulator Suite for local development
  - Create basic project folder structure following the design document
  - _Requirements: 12.1, 12.5_

- [x] 2. Implement core type definitions and constants
  - Create TypeScript interfaces for User, CD, MediaFile, ShareToken, EmailLog
  - Define ValidationResult and UploadProgress types
  - Create constants file with storage limits, allowed file types, and expiration defaults
  - _Requirements: 12.1_

- [x] 3. Implement Firebase Security Rules
  - Write Firestore security rules for users, CDs, files, and shareTokens collections
  - Write Storage security rules for user file uploads with type and size validation
  - Deploy rules to Firebase project
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3.1 Write unit tests for security rules using Firebase Emulator
  - Test owner access to CDs
  - Test share token access validation
  - Test expired token rejection
  - Test unauthorized access denial
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 4. Build ValidationService
  - Implement file type validation for allowed formats (jpg, png, mp3, wav, mp4)
  - Implement file size validation
  - Implement total size calculation for multiple files
  - Implement email format validation
  - Implement CD name validation
  - _Requirements: 4.1, 4.2, 11.1_

- [x] 4.1 Write property test for file type validation
  - **Property 11: File type validation is correct**
  - **Validates: Requirements 4.1**

- [x] 4.2 Write property test for storage capacity enforcement
  - **Property 12: Storage capacity is enforced**
  - **Validates: Requirements 4.2**

- [ ] 5. Build AuthService and authentication components
  - Implement AuthService with signup, login, logout, and password reset methods
  - Create AuthContext and AuthProvider for global auth state
  - Build SignUpForm component with validation
  - Build LoginForm component with error handling
  - Build PasswordResetForm component
  - Implement auth state persistence
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5.1 Write property test for valid signup
  - **Property 1: Valid signup creates authenticated user**
  - **Validates: Requirements 1.2, 1.4**

- [x] 5.2 Write property test for invalid credentials rejection
  - **Property 2: Invalid credentials are rejected**
  - **Validates: Requirements 1.3**

- [x] 5.3 Write property test for valid login
  - **Property 3: Valid login grants access**
  - **Validates: Requirements 2.2, 2.4**

- [x] 5.4 Write property test for invalid login rejection
  - **Property 4: Invalid login is rejected**
  - **Validates: Requirements 2.3**

- [x] 5.5 Write property test for password reset
  - **Property 5: Password reset sends email**
  - **Validates: Requirements 2.5**

- [x] 6. Build CDService and CD management components
  - Implement CDService with createCD, getUserCDs, getCD, updateCDStorage, deleteCD methods
  - Create CDContext for CD state management
  - Build CreateCDModal component for CD creation
  - Build CDCard component with disc icon and metadata display
  - Build CDCollection component with grid layout
  - Implement empty state for collection view
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Write property test for CD creation
  - **Property 6: CD creation initializes correctly**
  - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

- [x] 6.2 Write property test for collection retrieval
  - **Property 7: Collection retrieval is complete**
  - **Validates: Requirements 5.1, 5.2**

- [x] 6.3 Write property test for collection sorting
  - **Property 8: Collection sorting is correct**
  - **Validates: Requirements 5.5**

- [x] 6.4 Write property test for CD navigation
  - **Property 9: CD navigation works**
  - **Validates: Requirements 5.3**

- [x] 7. Build FileService and file upload components
  - Implement FileService with uploadFile, getFileMetadata, getFileDownloadURL, deleteFile methods
  - Implement file validation in FileService
  - Build FileUploader component with drag-and-drop support
  - Build BurningProgress component with retro animation and progress bar
  - Implement upload progress tracking with callbacks
  - Handle upload errors with specific error messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 11.1, 11.2_

- [x] 7.1 Write property test for upload storage path
  - **Property 13: Upload creates correct storage path**
  - **Validates: Requirements 4.4**

- [x] 7.2 Write property test for upload metadata and storage update
  - **Property 14: Upload updates metadata and storage**
  - **Validates: Requirements 4.5, 4.7**

- [x] 7.3 Write property test for upload progress tracking
  - **Property 15: Upload progress is tracked**
  - **Validates: Requirements 4.6**

- [x] 8. Build CD detail view and file management
  - Build CDDetailView component with CD header and file list
  - Build FileList component displaying files with thumbnails
  - Implement file preview functionality with FilePreviewModal
  - Build ImageViewer, AudioPlayer, and VideoPlayer components
  - Implement single file download with URL generation
  - Implement zip generation and full CD download
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8.1 Write property test for CD contents retrieval
  - **Property 10: CD contents retrieval is complete**
  - **Validates: Requirements 6.1, 6.2**

- [x] 8.2 Write property test for file preview
  - **Property 16: File preview shows correct component**
  - **Validates: Requirements 6.3**

- [x] 8.3 Write property test for single file download
  - **Property 17: Single file download generates URL**
  - **Validates: Requirements 6.4**

- [optional] 8.4 Write property test for CD zip download
  - **Property 18: CD zip contains all files**
  - **Validates: Requirements 6.5**

- [x] 9. Implement share token generation and storage
  - Create token generator utility using crypto.getRandomValues()
  - Implement ShareService with generateShareToken, validateShareToken methods
  - Add token storage to Firestore with expiration tracking
  - Implement token uniqueness checking
  - _Requirements: 7.2, 7.3, 8.1, 8.2, 9.5_

- [optional] 9.1 Write property test for share token generation
  - **Property 19: Share token is unique and time-limited**
  - **Validates: Requirements 7.2, 7.3**

- [optional] 9.2 Write property test for valid token access
  - **Property 22: Valid token grants access**
  - **Validates: Requirements 8.1, 8.2**

- [optional] 9.3 Write property test for expired token rejection
  - **Property 26: Expired tokens are rejected**
  - **Validates: Requirements 9.5**

- [x] 10. Build share UI components
  - Build ShareModal component with email and link tabs
  - Build ShareLinkDisplay component with copy-to-clipboard functionality
  - Build EmailShareForm component
  - Implement share link URL generation
  - Add toast notifications for copy and send confirmations
  - _Requirements: 7.1, 7.5_

- [x] 10.1 Write property test for share link format
  - **Property 21: Share link format is correct**
  - **Validates: Requirements 7.5**

- [x] 11. Implement email service with SMTP and Firestore logging
  - Install SMTP library (nodemailer or emailjs-com)
  - Create emailService.ts with sendShareEmail and logEmail methods
  - Implement SMTP configuration from environment variables
  - Create email template with share link and CD information
  - Log all email sends to Firestore emailLogs collection with status
  - Handle email sending errors with retry option and error logging
  - _Requirements: 7.4_

- [x] 11.1 Write property test for share email sending and logging
  - **Property 20: Share email is sent**
  - **Validates: Requirements 7.4**

- [x] 12. Build shared CD view for recipients
  - Build SharedCDView component for public access
  - Implement token extraction from URL
  - Implement guest access without authentication
  - Display CD contents with download options
  - Handle invalid and expired token errors
  - Add banner showing CD owner information
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12.1 Write property test for guest access
  - **Property 23: Guest access works**
  - **Validates: Requirements 8.5**

- [x] 12.2 Write property test for recipient view
  - **Property 24: Recipient view displays correctly**
  - **Validates: Requirements 8.4**

- [x] 13. Implement access control enforcement
  - Add access control checks to CDService methods
  - Implement owner verification logic
  - Implement share token verification logic
  - Add authorization error handling
  - Ensure security rules are enforced on all operations
  - _Requirements: 9.1, 9.2_

- [x] 13.1 Write property test for access control
  - **Property 25: Access control is enforced**
  - **Validates: Requirements 9.1, 9.2**

- [x] 14. Build retro UI components and styling
  - Create RetroLayout component with fixed-width container
  - Create RetroButton component with 3D effects
  - Build DiscAnimation component for insert/eject animations
  - Build LoadingSpinner component with CD spinning animation
  - Create global CSS with Y2K color palette and typography
  - Implement theme variables for consistent styling
  - _Requirements: 10.1_

- [x] 15. Implement animations and visual effects
  - Add burning animation to BurningProgress component
  - Implement disc insert/eject animations for CD open/close
  - Add hover effects to CD cards and buttons
  - Implement page transition animations
  - Add toast notification animations
  - _Requirements: 10.2, 10.3_

- [x] 15.1 Write property test for upload animation
  - **Property 27: Upload shows burning animation**
  - **Validates: Requirements 10.2**

- [x] 15.2 Write property test for CD animations
  - **Property 28: CD open/close triggers animations**
  - **Validates: Requirements 10.3**

- [x] 16. Implement error handling and user feedback
  - Add error boundaries to catch React component errors
  - Implement specific error messages for upload failures
  - Add capacity exceeded error with usage details
  - Implement authentication error mapping
  - Add network error handling with retry options
  - Implement share link error messages
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 16.1 Write property test for upload error messages
  - **Property 29: Upload errors are specific**
  - **Validates: Requirements 11.1**

- [x] 16.2 Write property test for auth error safety
  - **Property 30: Auth errors are safe**
  - **Validates: Requirements 11.3**

- [x] 16.3 Write property test for network error retry
  - **Property 31: Network errors offer retry**
  - **Validates: Requirements 11.5**

- [x] 17. Implement responsive design and fallbacks
  - Add responsive breakpoints for tablet and mobile
  - Implement mobile-friendly CD grid layout
  - Create simplified animations for slow devices
  - Add bottom sheet for mobile share modal
  - Implement touch-friendly file upload on mobile
  - _Requirements: 10.5_

- [x] 18. Set up routing and navigation
  - Configure React Router with routes for auth, collection, CD detail, and shared view
  - Implement protected routes requiring authentication
  - Add navigation guards for owner-only pages
  - Implement redirect logic after login/signup
  - Handle 404 and error routes
  - _Requirements: 1.4, 2.4, 5.3_

- [x] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Write integration tests for critical flows
  - Test complete upload flow: create CD → upload files → verify storage
  - Test share flow: create CD → generate link → access as recipient → download
  - Test authentication flow: signup → create CD → logout → login → verify persistence
  - Test capacity enforcement: upload near limit → attempt oversized upload → verify rejection
  - _Requirements: 4.2, 4.3, 7.2, 8.2_

- [ ] 21. Create documentation
  - Write README with project overview and setup instructions
  - Document Firebase configuration steps
  - Document data schema for Firestore and Storage
  - Document share link flow and token generation
  - Add code comments for complex logic
  - Create deployment guide
  - _Requirements: 12.5_

- [ ] 22. Final testing and deployment preparation
  - Run all unit and property tests
  - Test with Firebase Emulator Suite
  - Verify security rules are correctly deployed
  - Test production build locally
  - Prepare Firebase Hosting configuration
  - _Requirements: 12.1_

- [ ] 23. Deploy to Vercel
  - Build production bundle
  - Deploy Firestore and Storage security rules to Firebase
  - Configure environment variables in Vercel (Firebase config + SMTP credentials)
  - Deploy frontend to Vercel
  - Verify production deployment works correctly
  - _Requirements: 12.5_
