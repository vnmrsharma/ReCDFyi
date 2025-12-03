# Design Document: Public CD Marketplace

## Overview

The Public CD Marketplace feature extends ReCd(fyi) with social discovery capabilities, transforming it from a private sharing tool into a community platform. Users can publicly share their CDs, browse others' content, and track engagement through analytics. The system maintains the existing private sharing functionality while adding a public layer with username-based identity, marketplace discovery, creator profiles, and view tracking.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ Auth UI    │  │ Marketplace│  │ Profile UI             │ │
│  │ +Username  │  │ Browse UI  │  │ Analytics UI           │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┤
│  │         Application Services Layer                       │
│  │  - UserService (username management)                     │
│  │  - PublicCDService (public CD operations)                │
│  │  - AnalyticsService (view tracking)                      │
│  │  - MarketplaceService (browse, search, filter)           │
│  └──────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│   Firebase Services                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Firestore Collections:                               │ │
│  │  - users (extended with username, usernameL lower)   │ │
│  │  - cds (extended with isPublic, publicAt)            │ │
│  │  - publicCDs (denormalized for fast marketplace)     │ │
│  │  - cdViews (analytics tracking)                      │ │
│  │  - usernames (for uniqueness checking)               │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### Authentication Components (Extended)
- **SignUpForm** - Extended with username field and validation
- **UsernameInput** - Reusable username input with real-time uniqueness checking
- **ProfileSettings** - New component for viewing/editing username

#### Marketplace Components
- **MarketplacePage** - Main browse page with grid of public CDs
- **PublicCDCard** - Card showing public CD with creator info
- **MarketplaceFilters** - Search, sort, and filter controls
- **MarketplaceEmpty** - Empty state encouraging public sharing

#### Profile Components
- **CreatorProfile** - Public profile page showing username and public CDs
- **ProfileHeader** - Username, stats, join date display
- **PublicCDList** - List of creator's public CDs

#### Analytics Components
- **ViewAnalytics** - Component showing who viewed a public CD
- **ViewerList** - List of usernames and timestamps
- **AnalyticsStats** - Summary stats (total views, unique viewers)

#### CD Management Components (Extended)
- **PublicToggle** - Switch to make CD public/private
- **PublicIndicator** - Badge showing CD is public
- **PublicCDView** - Enhanced CD view for public access

### Application Services

#### UserService
```typescript
interface UserService {
  checkUsernameAvailability(username: string): Promise<boolean>;
  createUserWithUsername(email: string, password: string, username: string): Promise<User>;
  updateUsername(userId: string, newUsername: string): Promise<void>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserProfile(username: string): Promise<UserProfile>;
}
```

#### PublicCDService
```typescript
interface PublicCDService {
  toggleCDPublic(cdId: string, isPublic: boolean): Promise<void>;
  getPublicCDs(options?: QueryOptions): Promise<PublicCD[]>;
  getPublicCD(cdId: string): Promise<PublicCD>;
  getCreatorPublicCDs(username: string): Promise<PublicCD[]>;
  searchPublicCDs(query: string): Promise<PublicCD[]>;
}

interface QueryOptions {
  sortBy?: 'newest' | 'oldest' | 'mostViewed';
  limit?: number;
  startAfter?: string;
}
```

#### AnalyticsService
```typescript
interface AnalyticsService {
  recordView(cdId: string, viewerUsername: string): Promise<void>;
  getViewAnalytics(cdId: string): Promise<ViewAnalytics>;
  getViewCount(cdId: string): Promise<number>;
  hasUserViewed(cdId: string, username: string): Promise<boolean>;
}

interface ViewAnalytics {
  totalViews: number;
  uniqueViewers: number;
  viewers: ViewRecord[];
}

interface ViewRecord {
  username: string;
  viewedAt: Date;
}
```

## Data Models

### Extended Firestore Schema

#### Users Collection (Extended)
```
users/{userId}
  - email: string
  - username: string (unique, 3-20 chars)
  - usernameL: string (lowercase for case-insensitive queries)
  - createdAt: timestamp
  - displayName: string (optional)
  - publicCDCount: number (denormalized)
```

#### Usernames Collection (New - for uniqueness)
```
usernames/{usernameL}
  - userId: string
  - username: string (original case)
  - createdAt: timestamp
```

#### CDs Collection (Extended)
```
cds/{cdId}
  - userId: string
  - username: string (denormalized for display)
  - name: string
  - label: string (optional)
  - createdAt: timestamp
  - updatedAt: timestamp
  - storageUsedBytes: number
  - storageLimitBytes: number
  - fileCount: number
  - isPublic: boolean (NEW)
  - publicAt: timestamp (NEW - when made public)
  - viewCount: number (NEW - denormalized)
```

#### PublicCDs Collection (New - denormalized for performance)
```
publicCDs/{cdId}
  - cdId: string
  - userId: string
  - username: string
  - name: string
  - fileCount: number
  - createdAt: timestamp
  - publicAt: timestamp
  - viewCount: number
  - thumbnailUrl: string (optional - first image)
```

#### CDViews Collection (New - analytics)
```
cdViews/{cdId}/viewers/{userId}
  - cdId: string
  - viewerUserId: string
  - viewerUsername: string
  - viewedAt: timestamp
  - viewCount: number (for repeat views)
```

### TypeScript Interfaces

```typescript
interface User {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  publicCDCount?: number;
}

interface UserProfile {
  username: string;
  joinDate: Date;
  publicCDCount: number;
  publicCDs: PublicCD[];
}

interface PublicCD {
  id: string;
  userId: string;
  username: string;
  name: string;
  label?: string;
  fileCount: number;
  createdAt: Date;
  publicAt: Date;
  viewCount: number;
  thumbnailUrl?: string;
}

interface CDExtended extends CD {
  isPublic: boolean;
  publicAt?: Date;
  viewCount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Username Properties

**Property 1: Username uniqueness is enforced**
*For any* two users, their usernames must be different (case-insensitive), and attempting to create a duplicate username should be rejected.
**Validates: Requirements 1.2, 1.3**

**Property 2: Username format is validated**
*For any* username submission, it must be 3-20 characters, contain only alphanumeric characters and underscores, and have no spaces.
**Validates: Requirements 1.4**

**Property 3: Username is stored on signup**
*For any* successful signup with a valid username, the user document must contain the username field.
**Validates: Requirements 1.5**

### Public Toggle Properties

**Property 4: Public toggle updates CD visibility**
*For any* CD, toggling it to public should add it to the marketplace, and toggling to private should remove it immediately.
**Validates: Requirements 2.2, 2.3**

**Property 5: Public status is persisted**
*For any* CD that is toggled, the isPublic field in the database must match the toggle state.
**Validates: Requirements 2.5**

### Marketplace Properties

**Property 6: Marketplace shows only public CDs**
*For any* CD in the marketplace listings, its isPublic field must be true.
**Validates: Requirements 3.1, 9.1**

**Property 7: Marketplace displays creator info**
*For any* public CD displayed, it must show the creator's username.
**Validates: Requirements 3.2**

**Property 8: Marketplace sorting is correct**
*For any* marketplace view with default sorting, CDs must be ordered by publicAt timestamp descending (newest first).
**Validates: Requirements 3.4**

### Public CD View Properties

**Property 9: Public CDs are accessible to all**
*For any* public CD, any user (logged in or guest) should be able to view its contents.
**Validates: Requirements 4.1, 4.4**

**Property 10: View analytics records logged-in viewers**
*For any* logged-in user viewing a public CD, their username should be recorded in the view analytics.
**Validates: Requirements 4.3**

**Property 11: Guest views don't create analytics**
*For any* guest (non-logged-in user) viewing a public CD, no view record should be created.
**Validates: Requirements 4.4**

### Profile Properties

**Property 12: Profile shows creator's public CDs**
*For any* creator profile, it must display all CDs where userId matches and isPublic is true.
**Validates: Requirements 5.3**

**Property 13: Own profile shows all CDs**
*For any* user viewing their own profile, both public and private CDs should be visible.
**Validates: Requirements 5.4**

**Property 14: Other profiles show only public CDs**
*For any* user viewing another user's profile, only public CDs should be visible.
**Validates: Requirements 5.5**

### Analytics Properties

**Property 15: View analytics shows unique viewers**
*For any* public CD, the analytics should list each viewer username only once, even if they viewed multiple times.
**Validates: Requirements 6.3**

**Property 16: Analytics are owner-only**
*For any* CD's view analytics, only the owner should be able to access this data.
**Validates: Requirements 9.5**

### Search and Filter Properties

**Property 17: Search filters by name**
*For any* search query, returned CDs must have names that contain the query string (case-insensitive).
**Validates: Requirements 7.1**

**Property 18: Sort order is correct**
*For any* sort option selected, CDs must be ordered according to the specified criteria (newest, oldest, most viewed).
**Validates: Requirements 7.3**

### Privacy Properties

**Property 19: Private CDs are not in marketplace**
*For any* CD where isPublic is false, it must not appear in marketplace listings.
**Validates: Requirements 9.1**

**Property 20: Private CDs reject non-owner access**
*For any* private CD, access attempts from non-owners should be denied.
**Validates: Requirements 9.2**

### Username Management Properties

**Property 21: Username changes update all references**
*For any* username change, all public CDs owned by that user must reflect the new username.
**Validates: Requirements 10.3**

**Property 22: Username changes preserve analytics**
*For any* username change, the user's view analytics history must remain intact.
**Validates: Requirements 10.4**

## Error Handling

### Username Errors
- **Username taken**: "This username is already taken. Try: @username123, @username_2024"
- **Invalid format**: "Username must be 3-20 characters, letters, numbers, and underscores only"
- **Too short**: "Username must be at least 3 characters"
- **Too long**: "Username must be 20 characters or less"

### Public CD Errors
- **Toggle failed**: "Failed to update CD visibility. Please try again"
- **Not found**: "This public CD no longer exists or has been made private"
- **Access denied**: "This CD is private and you don't have access"

### Marketplace Errors
- **Load failed**: "Failed to load marketplace. Please refresh"
- **Search failed**: "Search temporarily unavailable. Please try again"
- **No results**: "No public CDs match your search. Try different keywords"

### Analytics Errors
- **Load failed**: "Failed to load view analytics. Please try again"
- **Permission denied**: "You don't have permission to view these analytics"

## Testing Strategy

### Unit Testing
- Username validation logic
- Public/private toggle functionality
- Search and filter algorithms
- Analytics calculation (unique viewers, counts)
- Username uniqueness checking

### Property-Based Testing
Using fast-check with minimum 100 iterations:

- Username format validation with random strings
- Public CD filtering with random visibility states
- Search matching with random queries and CD names
- Sort order verification with random CD sets
- Analytics uniqueness with random view records
- Username change propagation with random updates

### Integration Testing
- Complete public sharing flow: toggle public → appears in marketplace → view → analytics recorded
- Username signup flow: create with username → username appears on public CDs
- Profile flow: view profile → see public CDs → click CD → view contents
- Search flow: enter query → filter results → click CD → view

## UI/UX Specifications

### Marketplace Page
- Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: CD icon, name, creator username (@username), file count, view count
- Search bar at top
- Sort dropdown (Newest, Oldest, Most Viewed)
- Hover effect: card elevates, disc spins

### Creator Profile Page
- Header: Large username (@username), join date, public CD count
- Grid of public CDs below
- "Edit Profile" button if viewing own profile

### Public Toggle
- Toggle switch in CD detail view header
- Label: "Public" / "Private"
- Confirmation dialog: "Make this CD public? Anyone will be able to view and download it."

### View Analytics Panel
- Shown only to CD owner
- List of viewer usernames with timestamps
- Total unique viewers count
- "X people have viewed this CD"

### Navigation
- Add "Marketplace" link to main nav (between "My CDs" and username)
- Marketplace icon: 🌐 or grid icon

## Firebase Security Rules

### Extended Firestore Rules

```javascript
// Users collection - add username fields
match /users/{userId} {
  allow read: if true; // Public profiles
  allow create: if isAuthenticated() 
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.username is string
    && request.resource.data.username.size() >= 3
    && request.resource.data.username.size() <= 20;
  allow update: if isOwner(userId);
}

// Usernames collection - for uniqueness
match /usernames/{usernameL} {
  allow read: if true;
  allow create: if isAuthenticated() 
    && request.resource.data.userId == request.auth.uid;
  allow delete: if isAuthenticated() 
    && resource.data.userId == request.auth.uid;
}

// CDs collection - add public access
match /cds/{cdId} {
  allow read: if isOwner(resource.data.userId) 
    || hasValidShareToken(cdId)
    || resource.data.isPublic == true; // NEW: public access
  allow create: if isAuthenticated() 
    && request.resource.data.userId == request.auth.uid;
  allow update, delete: if isOwner(resource.data.userId);
}

// PublicCDs collection - read-only for marketplace
match /publicCDs/{cdId} {
  allow read: if true; // Anyone can browse
  allow write: if false; // Only via backend/cloud function
}

// CDViews collection - analytics
match /cdViews/{cdId}/viewers/{viewerId} {
  allow read: if isOwner(get(/databases/$(database)/documents/cds/$(cdId)).data.userId);
  allow create: if isAuthenticated() && request.auth.uid == viewerId;
  allow update: if isAuthenticated() && request.auth.uid == viewerId;
}
```

## Performance Considerations

### Denormalization Strategy
- Store username on CD documents to avoid joins
- Maintain publicCDs collection for fast marketplace queries
- Cache view counts on CD documents
- Use composite indexes for sorting (publicAt + viewCount)

### Pagination
- Marketplace: Load 20 CDs at a time with infinite scroll
- Analytics: Load 50 viewers at a time
- Profile CDs: Load all (typically < 50)

### Indexes Required
```
Collection: publicCDs
- publicAt DESC
- viewCount DESC
- username ASC, publicAt DESC
```

## Migration Strategy

For existing users without usernames:
1. Prompt for username on next login
2. Generate suggested username from email (e.g., user@email.com → @user)
3. Allow one-time username selection
4. Block access to public features until username is set

