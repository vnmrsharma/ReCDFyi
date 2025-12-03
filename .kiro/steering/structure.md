# Project Structure

## Directory Organization

```
recd-platform/
├── src/                    # Source code
│   ├── components/         # React components organized by feature
│   ├── services/           # Business logic and Firebase interactions
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React Context providers
│   ├── utils/              # Utility functions and constants
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles and theme
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── property/           # Property-based tests
│   └── integration/        # Integration tests
├── public/                 # Static assets
├── firebase config files   # Firebase configuration (rules only)
└── vercel.json             # Vercel deployment configuration
```

## Component Organization

Components are grouped by feature area:

- **auth/**: Authentication forms and providers (SignUpForm, LoginForm, AuthProvider)
- **cd/**: CD management (CDCollection, CDCard, CDDetailView, FileList)
- **upload/**: File upload functionality (FileUploader, BurningProgress)
- **share/**: Sharing features (ShareModal, SharedCDView, EmailShareForm)
- **ui/**: Reusable UI components (RetroButton, DiscAnimation, LoadingSpinner)
- **preview/**: File preview components (ImageViewer, AudioPlayer, VideoPlayer)

## Service Layer

Services encapsulate business logic and Firebase interactions:

- **authService.ts**: User authentication operations
- **cdService.ts**: CD CRUD operations
- **fileService.ts**: File upload, download, and validation
- **shareService.ts**: Share token generation and validation
- **emailService.ts**: SMTP email sending and logging to Firestore
- **validationService.ts**: Input validation logic

Each service must:
- Export pure, stateless functions
- Handle errors gracefully with typed error responses
- Include JSDoc comments for public methods
- Be independently testable

## Data Models

### Firestore Collections

- `users/{userId}`: User profiles
- `cds/{cdId}`: CD metadata
- `cds/{cdId}/files/{fileId}`: File metadata (subcollection)
- `shareTokens/{tokenId}`: Share tokens with expiration
- `emailLogs/{logId}`: Email sending logs with status and metadata

### Firebase Storage Structure

```
users/{userId}/cds/{cdId}/files/{fileId}.{ext}
users/{userId}/cds/{cdId}/thumbnails/{fileId}_thumb.jpg
```

## Testing Structure

- **Unit tests**: Mirror source structure in `tests/unit/`
- **Property tests**: Organized by feature in `tests/property/`
- **Integration tests**: End-to-end flows in `tests/integration/`

Property tests must include comments referencing the design document:
```javascript
// Feature: recd-platform, Property 6: CD creation initializes correctly
```

## Naming Conventions

- **Components**: PascalCase (e.g., `CDCard.tsx`)
- **Services**: camelCase with Service suffix (e.g., `authService.ts`)
- **Hooks**: camelCase with use prefix (e.g., `useAuth.ts`)
- **Types**: PascalCase for interfaces (e.g., `User`, `CD`, `MediaFile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_STORAGE_BYTES`)

## Module Boundaries

- Components should not directly import Firebase SDK or SMTP libraries
- All Firebase operations go through service layer
- All email operations go through emailService
- Services are stateless and export pure functions
- Contexts manage global state, not business logic
- Validation logic is centralized in ValidationService
- No business logic in components - only UI and event handling

## Code Quality Principles

- **Single Responsibility**: Each module/component does one thing well
- **DRY**: Don't repeat yourself - extract common logic
- **Explicit over Implicit**: Clear function names and parameters
- **Error Handling**: Always handle errors, never silent failures
- **Type Safety**: No `any` types unless absolutely necessary
- **Documentation**: Complex logic must have explanatory comments

## Security Rules

- `firestore.rules`: Firestore security rules
- `storage.rules`: Firebase Storage security rules
- Rules enforce access control at the database level
- Client-side checks are for UX only; server-side rules are authoritative
