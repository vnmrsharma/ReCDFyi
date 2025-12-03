# Design Document

## Overview

ReCd(fyi) is a serverless virtual CD media sharing platform built with React and Firebase. The architecture follows a client-side application pattern where all business logic runs in the browser, with Firebase providing backend services (authentication, database, storage) and security enforcement through Firebase Security Rules. Email sending is handled directly from the frontend via SMTP with all email activity logged to Firestore. The application recreates the nostalgic experience of CD burning software from the early 2000s with retro UI/UX elements including disc animations, burning progress bars, and Y2K-era styling.

The system is organized into three primary layers:
1. **Presentation Layer**: React components with retro styling and animations
2. **Application Layer**: Business logic for CD management, file operations, sharing, and email sending
3. **Firebase Services Layer**: Authentication, Firestore database, and Cloud Storage

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ Auth UI    │  │ CD Manager │  │ Share UI               │ │
│  │ Components │  │ Components │  │ Components             │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┤
│  │         Application Services Layer                       │
│  │  - AuthService  - CDService  - FileService               │
│  │  - ShareService - EmailService - ValidationService       │
│  └──────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────────┐  ┌──────────────────┐
│   Firebase Services       │  │  SMTP Server     │
│  ┌──────────────────────┐ │  │  (Direct Email)  │
│  │ Firebase Auth        │ │  └──────────────────┘
│  │ Firestore Database   │ │
│  │ Firebase Storage     │ │
│  │ (includes emailLogs) │ │
│  └──────────────────────┘ │
└───────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18+ with React Router for navigation
- **State Management**: React Context API + hooks for global state
- **Styling**: CSS Modules with retro/Y2K theme variables
- **Authentication**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore for metadata storage
- **File Storage**: Firebase Cloud Storage for media files
- **Email Service**: Direct SMTP from frontend (nodemailer or emailjs-com)
- **Build Tool**: Vite
- **Hosting**: Vercel

## Components and Interfaces

### Frontend Components

#### Authentication Components
- **SignUpForm**: Registration form with email/password validation
- **LoginForm**: Login form with authentication error handling
- **PasswordResetForm**: Password recovery interface
- **AuthProvider**: Context provider for authentication state

#### CD Management Components
- **CDCollection**: Grid view of all user CDs with disc icons
- **CDCard**: Individual disc representation with metadata display
- **CreateCDModal**: Form for creating new CDs
- **CDDetailView**: Detailed view of CD contents
- **FileList**: List of files within a CD with thumbnails
- **FilePreviewModal**: Modal for previewing images/audio/video

#### Upload Components
- **FileUploader**: Drag-and-drop file upload interface
- **BurningProgress**: Retro burning animation with progress bar
- **UploadValidation**: Real-time validation feedback for file size/type

#### Share Components
- **ShareModal**: Dialog for generating and sending share links
- **ShareLinkDisplay**: Component for displaying and copying share URLs
- **EmailShareForm**: Form for entering recipient email
- **SharedCDView**: Public view for recipients accessing shared CDs

#### UI/Animation Components
- **DiscAnimation**: CD insert/eject animations
- **RetroButton**: Styled button with Y2K aesthetic
- **RetroLayout**: Fixed-width container with retro styling
- **LoadingSpinner**: CD-spinning loader animation

### Application Services

#### AuthService
```typescript
interface AuthService {
  signUp(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}
```

#### CDService
```typescript
interface CDService {
  createCD(userId: string, name: string, label?: string): Promise<CD>;
  getUserCDs(userId: string): Promise<CD[]>;
  getCD(cdId: string): Promise<CD>;
  updateCDStorage(cdId: string, usedBytes: number): Promise<void>;
  deleteCD(cdId: string): Promise<void>;
}
```

#### FileService
```typescript
interface FileService {
  uploadFile(cdId: string, userId: string, file: File, onProgress: (progress: number) => void): Promise<MediaFile>;
  getFileMetadata(cdId: string): Promise<MediaFile[]>;
  getFileDownloadURL(filePath: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  validateFile(file: File, remainingSpace: number): ValidationResult;
  generateZipDownload(files: MediaFile[]): Promise<Blob>;
}
```

#### ShareService
```typescript
interface ShareService {
  generateShareToken(cdId: string, expirationDays: number): Promise<ShareToken>;
  validateShareToken(token: string): Promise<{ valid: boolean; cdId?: string }>;
  getSharedCD(token: string): Promise<CD>;
}
```

#### EmailService
```typescript
interface EmailService {
  sendShareEmail(recipientEmail: string, shareLink: string, cdName: string, senderEmail: string): Promise<EmailLog>;
  logEmail(emailData: EmailLogData): Promise<EmailLog>;
  getEmailLogs(userId: string): Promise<EmailLog[]>;
}

interface EmailLogData {
  userId: string;
  recipientEmail: string;
  subject: string;
  cdId: string;
  cdName: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

interface EmailLog extends EmailLogData {
  id: string;
  sentAt: Date;
}
```

#### ValidationService
```typescript
interface ValidationService {
  validateFileType(file: File): boolean;
  validateFileSize(file: File, maxSize: number): boolean;
  calculateTotalSize(files: File[]): number;
  validateEmail(email: string): boolean;
  validateCDName(name: string): boolean;
}
```

## Data Models

### Firestore Schema

#### Users Collection
```
users/{userId}
  - email: string
  - createdAt: timestamp
  - displayName: string (optional)
```

#### CDs Collection
```
cds/{cdId}
  - userId: string (owner)
  - name: string
  - label: string (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
  - storageUsedBytes: number
  - storageLimitBytes: number (20 * 1024 * 1024)
  - fileCount: number
```

#### Files Collection (subcollection of CDs)
```
cds/{cdId}/files/{fileId}
  - filename: string
  - originalName: string
  - fileType: string (image/audio/video)
  - mimeType: string
  - sizeBytes: number
  - storagePath: string
  - uploadedAt: timestamp
  - thumbnailPath: string (optional, for images)
```

#### ShareTokens Collection
```
shareTokens/{tokenId}
  - cdId: string
  - token: string (unique, indexed)
  - createdAt: timestamp
  - expiresAt: timestamp
  - createdBy: string (userId)
  - accessCount: number
```

#### EmailLogs Collection
```
emailLogs/{logId}
  - userId: string (sender)
  - recipientEmail: string
  - subject: string
  - cdId: string
  - cdName: string
  - status: string (pending/sent/failed)
  - error: string (optional)
  - sentAt: timestamp
```

### Firebase Storage Structure

```
users/
  {userId}/
    cds/
      {cdId}/
        files/
          {fileId}.{extension}
        thumbnails/
          {fileId}_thumb.jpg
```

### TypeScript Interfaces

```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface CD {
  id: string;
  userId: string;
  name: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
  storageUsedBytes: number;
  storageLimitBytes: number;
  fileCount: number;
}

interface MediaFile {
  id: string;
  cdId: string;
  filename: string;
  originalName: string;
  fileType: 'image' | 'audio' | 'video';
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  uploadedAt: Date;
  thumbnailPath?: string;
}

interface ShareToken {
  id: string;
  cdId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
  accessCount: number;
}

interface EmailLog {
  id: string;
  userId: string;
  recipientEmail: string;
  subject: string;
  cdId: string;
  cdName: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  sentAt: Date;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface UploadProgress {
  fileIndex: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication Properties

**Property 1: Valid signup creates authenticated user**
*For any* valid email and password combination, successfully creating an account should result in an authenticated user with access to the CD collection view.
**Validates: Requirements 1.2, 1.4**

**Property 2: Invalid credentials are rejected**
*For any* invalid email format or weak password, the signup process should reject the credentials and display specific validation errors without creating an account.
**Validates: Requirements 1.3**

**Property 3: Valid login grants access**
*For any* existing user with valid credentials, logging in should authenticate the user and redirect to their CD collection view.
**Validates: Requirements 2.2, 2.4**

**Property 4: Invalid login is rejected**
*For any* incorrect email or password combination, the login attempt should fail with an authentication error and prevent access.
**Validates: Requirements 2.3**

**Property 5: Password reset sends email**
*For any* registered user email, requesting a password reset should trigger a reset email via Firebase Auth.
**Validates: Requirements 2.5**

### CD Management Properties

**Property 6: CD creation initializes correctly**
*For any* valid CD name and optional label, creating a CD should result in a new CD with a unique ID, associated with the correct user, initialized with 0 bytes used and 20 MB limit, and appearing in the user's collection.
**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

**Property 7: Collection retrieval is complete**
*For any* user with CDs, accessing the collection view should retrieve and display all CDs belonging to that user with correct metadata (name, storage used/remaining, creation date).
**Validates: Requirements 5.1, 5.2**

**Property 8: Collection sorting is correct**
*For any* collection of CDs, they should be displayed sorted by creation date with newest first.
**Validates: Requirements 5.5**

**Property 9: CD navigation works**
*For any* CD in the collection, clicking on it should navigate to the detailed view for that specific CD.
**Validates: Requirements 5.3**

**Property 10: CD contents retrieval is complete**
*For any* CD with files, opening the CD should retrieve and display all files with correct metadata (thumbnail for images, filename, type, size).
**Validates: Requirements 6.1, 6.2**

### File Upload Properties

**Property 11: File type validation is correct**
*For any* file, the validation should accept only allowed formats (jpg, png, mp3, wav, mp4) and reject all other file types.
**Validates: Requirements 4.1**

**Property 12: Storage capacity is enforced**
*For any* CD and set of files, the upload should be accepted only if the total size does not exceed the CD's remaining storage capacity.
**Validates: Requirements 4.2**

**Property 13: Upload creates correct storage path**
*For any* successfully uploaded file, it should be stored in Firebase Storage at the path `users/{userId}/cds/{cdId}/files/{fileId}.{extension}`.
**Validates: Requirements 4.4**

**Property 14: Upload updates metadata and storage**
*For any* successfully uploaded file, a metadata document should be created in Firestore with all required fields (filename, type, size, timestamp), and the CD's storage usage should be incremented by the file size.
**Validates: Requirements 4.5, 4.7**

**Property 15: Upload progress is tracked**
*For any* file upload in progress, progress updates should be emitted reflecting the current upload state (bytes transferred, percentage complete).
**Validates: Requirements 4.6**

### File Access Properties

**Property 16: File preview shows correct component**
*For any* file type (image/audio/video), clicking to preview should display the appropriate preview component (image viewer, audio player, video player).
**Validates: Requirements 6.3**

**Property 17: Single file download generates URL**
*For any* file in a CD, requesting download should generate a valid download URL from Firebase Storage and initiate the download.
**Validates: Requirements 6.4**

**Property 18: CD zip contains all files**
*For any* CD with files, requesting a full CD download should generate a zip archive containing all files from that CD.
**Validates: Requirements 6.5**

### Sharing Properties

**Property 19: Share token is unique and time-limited**
*For any* CD being shared, generating a share token should create a unique token with a 30-day expiration, stored in Firestore with the CD association, creation timestamp, and expiration date.
**Validates: Requirements 7.2, 7.3**

**Property 20: Share email is sent**
*For any* valid recipient email and share link, sending via email should call the Email API with the correct share link and CD information.
**Validates: Requirements 7.4**

**Property 21: Share link format is correct**
*For any* generated share token, the share URL should include the token and be in the correct format for recipient access.
**Validates: Requirements 7.5**

**Property 22: Valid token grants access**
*For any* valid and non-expired share token, accessing the share link should extract the token, validate it, and grant access to the CD contents.
**Validates: Requirements 8.1, 8.2**

**Property 23: Guest access works**
*For any* recipient with a valid share token, they should be able to view and download CD contents without authentication.
**Validates: Requirements 8.5**

**Property 24: Recipient view displays correctly**
*For any* recipient with valid access, the CD view should display all files with preview and download options.
**Validates: Requirements 8.4**

### Access Control Properties

**Property 25: Access control is enforced**
*For any* CD access attempt, access should be granted only if the user is the owner or possesses a valid share token; otherwise, access should be denied with an authorization error.
**Validates: Requirements 9.1, 9.2**

**Property 26: Expired tokens are rejected**
*For any* share token past its expiration date, access attempts should be rejected as invalid.
**Validates: Requirements 9.5**

### UI/Animation Properties

**Property 27: Upload shows burning animation**
*For any* file upload in progress, the burning animation component with progress bar should be displayed.
**Validates: Requirements 10.2**

**Property 28: CD open/close triggers animations**
*For any* CD being opened or closed, the appropriate disc-insert or disc-eject animation should be triggered.
**Validates: Requirements 10.3**

### Error Handling Properties

**Property 29: Upload errors are specific**
*For any* failed file upload, the error message should indicate the specific failure reason (size limit, invalid type, network error).
**Validates: Requirements 11.1**

**Property 30: Auth errors are safe**
*For any* authentication failure, the error message should be clear but not expose sensitive security information (e.g., whether email exists).
**Validates: Requirements 11.3**

**Property 31: Network errors offer retry**
*For any* network error, the UI should display a retry option indicating the operation can be attempted again.
**Validates: Requirements 11.5**


## Error Handling

### Client-Side Validation Errors
- **Invalid file type**: Display error listing allowed formats (jpg, png, mp3, wav, mp4)
- **File too large**: Show error with file size and per-file limit (5 MB for video)
- **CD capacity exceeded**: Display friendly message showing current usage (e.g., "18 MB used") and remaining capacity (e.g., "2 MB remaining")
- **Invalid email format**: Show inline validation error on email fields
- **Weak password**: Display password requirements (minimum length, complexity)
- **Empty CD name**: Require CD name before creation

### Firebase Errors
- **Authentication errors**: Map Firebase auth error codes to user-friendly messages
  - `auth/email-already-in-use`: "This email is already registered"
  - `auth/invalid-email`: "Please enter a valid email address"
  - `auth/weak-password`: "Password must be at least 6 characters"
  - `auth/user-not-found`: "Invalid email or password"
  - `auth/wrong-password`: "Invalid email or password"
- **Storage errors**: Handle upload failures with retry option
  - Network errors: "Upload failed. Please check your connection and try again"
  - Permission errors: "You don't have permission to upload to this CD"
- **Firestore errors**: Handle database operation failures
  - Permission denied: "You don't have access to this resource"
  - Not found: "This CD no longer exists"

### Share Link Errors
- **Invalid token**: "This share link is invalid or has been revoked"
- **Expired token**: "This share link has expired. Please request a new link from the owner"
- **CD deleted**: "This CD is no longer available"

### Network Errors
- **Connection timeout**: Display retry button with "Connection timed out. Try again?"
- **Offline mode**: Show offline indicator and queue operations for when connection returns
- **Rate limiting**: "Too many requests. Please wait a moment and try again"

### Error Recovery Strategies
- **Retry mechanism**: Implement exponential backoff for transient failures
- **Partial upload recovery**: Allow resuming interrupted uploads where possible
- **Graceful degradation**: Disable animations on slow connections, maintain core functionality
- **Error boundaries**: Catch React component errors and display fallback UI
- **Logging**: Log errors to console (development) and error tracking service (production)

## Testing Strategy

### Unit Testing

The application will use **Jest** and **React Testing Library** for unit tests. Unit tests will focus on:

- **Component rendering**: Verify components render correctly with various props
- **User interactions**: Test button clicks, form submissions, navigation
- **Validation logic**: Test ValidationService functions with specific examples
- **Service functions**: Test individual service methods with mocked Firebase
- **Error handling**: Test error states and error message display
- **Edge cases**: Empty states, maximum capacity, expired tokens

Example unit tests:
- Test that SignUpForm displays validation errors for invalid email
- Test that FileUploader rejects files over 20 MB
- Test that CDCard displays correct storage usage
- Test that ShareModal generates correct share URL format
- Test that expired token shows appropriate error message

### Property-Based Testing

The application will use **fast-check** (JavaScript property-based testing library) for property tests. Each property test will run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

Property-based tests will verify universal properties across all valid inputs:

- **Authentication properties**: Test signup/login with randomly generated valid/invalid credentials
- **CD creation properties**: Test CD creation with random names and verify invariants (unique ID, correct limit, owner association)
- **File upload properties**: Test uploads with random file combinations and verify storage calculations
- **Validation properties**: Test file type and size validation with random files
- **Sharing properties**: Test token generation uniqueness and expiration logic
- **Access control properties**: Test permission checks with random user/token combinations
- **Sorting properties**: Test CD collection sorting with random creation dates

Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document using the format:
```javascript
// Feature: recd-platform, Property 6: CD creation initializes correctly
```

### Integration Testing

Integration tests will verify end-to-end flows using Firebase Emulator Suite:

- **Complete upload flow**: Create CD → upload files → verify storage and metadata
- **Share flow**: Create CD → generate share link → access as recipient → download
- **Authentication flow**: Sign up → create CD → log out → log in → verify CDs persist
- **Capacity enforcement**: Upload files until near limit → attempt oversized upload → verify rejection

### Firebase Security Rules Testing

Security rules will be tested using Firebase Emulator Suite with the `@firebase/rules-unit-testing` library:

- Test that users can only read/write their own CDs
- Test that valid share tokens grant read access
- Test that expired tokens are rejected
- Test that storage paths enforce user/CD isolation
- Test that direct public access to storage is blocked

### Testing Configuration

- **Test framework**: Jest with React Testing Library
- **Property testing**: fast-check (minimum 100 iterations per property)
- **Firebase mocking**: Firebase Emulator Suite for integration tests
- **Coverage target**: 80% code coverage for core business logic
- **CI/CD**: Run all tests on every commit, block merges if tests fail


## UI/UX Specifications

### Design System

#### Color Palette (Y2K/Retro Theme)
```css
--primary-blue: #0066FF
--primary-purple: #9933FF
--accent-cyan: #00FFFF
--accent-pink: #FF00FF
--bg-silver: #C0C0C0
--bg-dark: #000080
--text-black: #000000
--text-white: #FFFFFF
--border-gray: #808080
--success-green: #00FF00
--error-red: #FF0000
--warning-yellow: #FFFF00
```

#### Typography
- **Primary font**: "MS Sans Serif", "Tahoma", sans-serif (system fonts)
- **Monospace font**: "Courier New", monospace
- **Heading sizes**: 16px (h1), 14px (h2), 12px (h3)
- **Body text**: 11px
- **Button text**: 11px, bold

#### Layout
- **Container width**: Fixed 960px (centered)
- **Border style**: 2px solid borders with 3D effects (inset/outset)
- **Spacing**: 8px base unit (multiples of 8)
- **Border radius**: 0px (sharp corners for retro feel)

### Page Layouts

#### 1. Authentication Pages (Sign Up / Login)

**Layout**:
- Centered modal-style box (400px width)
- Silver gradient background
- 3D border effect
- Logo/title at top
- Form fields with labels
- Primary action button
- Secondary link (e.g., "Already have an account?")

**States**:
- Default: Empty form
- Validation error: Red text below invalid fields
- Loading: Button disabled with "Processing..." text
- Success: Brief success message before redirect

#### 2. CD Collection View

**Layout**:
- Header bar with app logo, user email, logout button
- "Create New CD" button (prominent, top-right)
- Grid of CD icons (4 columns on desktop, responsive)
- Each CD card shows:
  - Disc icon (colorful, spinning on hover)
  - CD name (bold, 14px)
  - Storage bar (visual progress bar)
  - Storage text: "15 MB / 20 MB"
  - Creation date (small, gray text)

**States**:
- Empty state: Large disc icon with "Create your first CD" message
- Loading: Skeleton loaders for CD cards
- Hover: CD icon spins, card elevates slightly
- Error: Error message banner at top

#### 3. CD Detail View

**Layout**:
- Back button to collection
- CD header section:
  - Large disc icon (left)
  - CD name and label (center)
  - Storage info and share button (right)
- File upload area (drag-and-drop zone)
- File list (table or grid view):
  - Thumbnail (for images)
  - Filename
  - File type icon
  - File size
  - Actions: Preview, Download, Delete

**States**:
- Empty CD: "Drag files here or click to upload"
- Uploading: Burning animation overlay with progress bar
- Upload complete: Success animation, files appear in list
- Upload error: Error message with retry option
- File preview: Modal overlay with file preview

#### 4. Burning Animation

**Design**:
- Full-screen or modal overlay
- Animated CD disc spinning
- Progress bar below disc (0-100%)
- Text: "Burning CD... 45%" or "Uploading files... 2 of 5"
- Retro loading animation (e.g., rotating disc with laser effect)

**Behavior**:
- Appears when files are uploading
- Progress bar updates in real-time
- Cannot be dismissed until complete or error
- Success: Brief "Burn complete!" message with checkmark
- Error: "Burn failed" with error details and retry button

#### 5. Share Modal

**Layout**:
- Modal dialog (500px width)
- Title: "Share CD: [CD Name]"
- Two tabs or sections:
  1. **Email Share**: Input field for recipient email, send button
  2. **Link Share**: Read-only input with share URL, copy button
- Expiration info: "Link expires in 30 days"
- Close button

**States**:
- Default: Empty email field, generated link visible
- Sending: "Sending..." on button
- Success: "Email sent!" confirmation message
- Error: "Failed to send email" with retry
- Link copied: "Link copied to clipboard!" toast notification

#### 6. Shared CD View (Recipient)

**Layout**:
- Similar to CD Detail View but read-only
- Banner at top: "Shared by [owner email]"
- No upload or delete options
- Download buttons for individual files and full CD
- Optional: "Sign up to create your own CDs" CTA

**States**:
- Loading: Skeleton loaders
- Valid access: Full CD contents visible
- Invalid/expired token: Error page with message
- Guest mode: Limited UI, download-focused

### Animations

#### Disc Insert/Eject
- **Insert**: CD slides in from right, rotates into position (0.5s)
- **Eject**: CD rotates and slides out to right (0.5s)
- Triggered when opening/closing CD detail view

#### Burning Progress
- **Disc spin**: Continuous rotation during upload
- **Laser effect**: Animated line moving across disc
- **Progress bar**: Smooth fill animation
- **Completion**: Disc stops spinning, checkmark appears

#### Hover Effects
- **CD cards**: Slight elevation (box-shadow), disc icon spins
- **Buttons**: 3D press effect (inset border on active)
- **File items**: Background color change, show action buttons

#### Transitions
- **Page navigation**: Fade in/out (0.3s)
- **Modal open/close**: Scale and fade (0.2s)
- **Toast notifications**: Slide in from top (0.3s)

### Responsive Behavior

#### Desktop (> 960px)
- Fixed 960px container, centered
- 4-column CD grid
- Full animations and effects

#### Tablet (600px - 960px)
- Fluid width with padding
- 2-column CD grid
- Reduced animations

#### Mobile (< 600px)
- Full width with minimal padding
- 1-column CD grid
- Simplified animations or no animations
- Stacked layout for CD detail header
- Bottom sheet for share modal

### Accessibility

- **Keyboard navigation**: All interactive elements accessible via Tab
- **Focus indicators**: Visible focus outlines on all focusable elements
- **ARIA labels**: Proper labels for screen readers
- **Alt text**: Descriptive alt text for images and icons
- **Color contrast**: Ensure text meets WCAG AA standards
- **Error announcements**: Screen reader announcements for errors

## Firebase Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasValidShareToken(cdId) {
      let token = request.query.token;
      let tokenDoc = get(/databases/$(database)/documents/shareTokens/$(token));
      return tokenDoc != null 
        && tokenDoc.data.cdId == cdId 
        && tokenDoc.data.expiresAt > request.time;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // CDs collection
    match /cds/{cdId} {
      allow read: if isOwner(resource.data.userId) || hasValidShareToken(cdId);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
      
      // Files subcollection
      match /files/{fileId} {
        allow read: if isOwner(get(/databases/$(database)/documents/cds/$(cdId)).data.userId) 
                    || hasValidShareToken(cdId);
        allow write: if isOwner(get(/databases/$(database)/documents/cds/$(cdId)).data.userId);
      }
    }
    
    // ShareTokens collection
    match /shareTokens/{tokenId} {
      allow read: if true; // Tokens are validated by expiration and cdId
      allow create: if isAuthenticated() 
                    && isOwner(get(/databases/$(database)/documents/cds/$(request.resource.data.cdId)).data.userId);
      allow update, delete: if isOwner(resource.data.createdBy);
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasValidShareToken(cdId) {
      let token = request.query.token;
      let tokenDoc = firestore.get(/databases/(default)/documents/shareTokens/$(token));
      return tokenDoc != null 
        && tokenDoc.data.cdId == cdId 
        && tokenDoc.data.expiresAt > request.time;
    }
    
    function isValidFileType() {
      return request.resource.contentType.matches('image/(jpeg|png)')
          || request.resource.contentType.matches('audio/(mpeg|wav)')
          || request.resource.contentType == 'video/mp4';
    }
    
    function isValidFileSize() {
      // Max 5 MB per file for videos, 20 MB for others (enforced at CD level)
      return request.resource.size <= 5 * 1024 * 1024 
          || (request.resource.contentType != 'video/mp4' && request.resource.size <= 20 * 1024 * 1024);
    }
    
    // User files
    match /users/{userId}/cds/{cdId}/{allPaths=**} {
      allow read: if isOwner(userId) || hasValidShareToken(cdId);
      allow write: if isOwner(userId) && isValidFileType() && isValidFileSize();
      allow delete: if isOwner(userId);
    }
  }
}
```

## Share Token Generation

### Token Format
- **Algorithm**: Generate cryptographically secure random string
- **Length**: 32 characters (base64url encoded)
- **Uniqueness**: Check Firestore for collisions before saving
- **Example**: `a7B9cD2eF4gH6iJ8kL0mN3oP5qR7sT9u`

### Token Storage Schema
```typescript
{
  id: string;              // Firestore document ID
  token: string;           // The actual token (indexed for fast lookup)
  cdId: string;            // Reference to the CD
  createdBy: string;       // User ID of creator
  createdAt: Timestamp;    // Creation time
  expiresAt: Timestamp;    // Expiration time (createdAt + 30 days)
  accessCount: number;     // Track how many times accessed
}
```

### Token Generation Process
1. Generate random 32-character string using `crypto.getRandomValues()`
2. Encode as base64url (URL-safe)
3. Check Firestore `shareTokens` collection for existing token
4. If collision, regenerate (extremely unlikely)
5. Create document with token, cdId, timestamps
6. Return token for URL construction

### Share URL Format
```
https://recd.fyi/share/{token}
```

### Token Validation Process
1. Extract token from URL path
2. Query Firestore `shareTokens` collection where `token == extractedToken`
3. Check if document exists
4. Verify `expiresAt > currentTime`
5. If valid, retrieve `cdId` and grant access
6. Increment `accessCount` (optional analytics)
7. If invalid/expired, show error page

## Project Structure

```
recd-platform/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── disc-icon.svg
│       └── retro-fonts/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── PasswordResetForm.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── cd/
│   │   │   ├── CDCollection.tsx
│   │   │   ├── CDCard.tsx
│   │   │   ├── CreateCDModal.tsx
│   │   │   ├── CDDetailView.tsx
│   │   │   └── FileList.tsx
│   │   ├── upload/
│   │   │   ├── FileUploader.tsx
│   │   │   ├── BurningProgress.tsx
│   │   │   └── UploadValidation.tsx
│   │   ├── share/
│   │   │   ├── ShareModal.tsx
│   │   │   ├── ShareLinkDisplay.tsx
│   │   │   ├── EmailShareForm.tsx
│   │   │   └── SharedCDView.tsx
│   │   ├── ui/
│   │   │   ├── DiscAnimation.tsx
│   │   │   ├── RetroButton.tsx
│   │   │   ├── RetroLayout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── preview/
│   │       ├── FilePreviewModal.tsx
│   │       ├── ImageViewer.tsx
│   │       ├── AudioPlayer.tsx
│   │       └── VideoPlayer.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── cdService.ts
│   │   ├── fileService.ts
│   │   ├── shareService.ts
│   │   ├── emailService.ts
│   │   └── validationService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCDs.ts
│   │   ├── useFileUpload.ts
│   │   ├── useShareToken.ts
│   │   └── useEmail.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CDContext.tsx
│   ├── utils/
│   │   ├── firebase.ts
│   │   ├── smtp.ts
│   │   ├── tokenGenerator.ts
│   │   ├── zipGenerator.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── cd.ts
│   │   ├── file.ts
│   │   ├── share.ts
│   │   └── email.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css
│   │   └── animations.css
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── components/
│   │   └── utils/
│   ├── property/
│   │   ├── auth.property.test.ts
│   │   ├── cd.property.test.ts
│   │   ├── upload.property.test.ts
│   │   ├── share.property.test.ts
│   │   └── email.property.test.ts
│   └── integration/
│       ├── upload-flow.test.ts
│       ├── share-flow.test.ts
│       └── auth-flow.test.ts
├── firebase.json
├── firestore.rules
├── storage.rules
├── .firebaserc
├── vercel.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Implementation Notes

### Firebase Configuration
- Create Firebase project in console
- Enable Authentication (Email/Password provider)
- Create Firestore database (start in test mode, then apply security rules)
- Create Storage bucket (apply security rules)
- Install Firebase SDK: `npm install firebase`
- Initialize Firebase in `src/utils/firebase.ts`

### Email Service Setup
- Install SMTP library: `npm install nodemailer` or `npm install emailjs-com`
- Configure SMTP credentials in environment variables
- Implement emailService.ts for sending emails and logging to Firestore
- All email sends must create a log entry in the emailLogs collection
- Handle SMTP errors gracefully with retry logic

### Development Workflow
1. Set up Firebase Emulator Suite for local development
2. Run emulators: `firebase emulators:start`
3. Develop against local emulators (no production data)
4. Write tests using emulator
5. Deploy to Vercel when ready

### Code Quality Standards
- **Modular Architecture**: Clear separation between components, services, and utilities
- **Single Responsibility**: Each module does one thing well
- **No Business Logic in Components**: Components only handle UI and events
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Error Handling**: All async operations must have try-catch blocks
- **Documentation**: Complex functions must have JSDoc comments

### Performance Optimizations
- Lazy load components with React.lazy()
- Implement virtual scrolling for large file lists
- Use Firebase Storage download URLs with caching
- Compress images before upload (client-side)
- Implement pagination for CD collections (if > 50 CDs)

### Security Considerations
- Never expose Firebase API keys in client code (they're meant to be public but restricted by security rules)
- Implement rate limiting on share email sends
- Validate all inputs on client and enforce with security rules
- Use HTTPS only (enforced by Firebase Hosting)
- Implement CORS properly for storage downloads
- Consider adding reCAPTCHA for signup to prevent abuse

