# Implementation Plan: Public CD Marketplace

- [x] 1. Extend data models and types for public marketplace
  - Add username, usernameL, publicCDCount fields to User interface
  - Create PublicCD, UserProfile, ViewAnalytics, ViewRecord interfaces
  - Extend CD interface with isPublic, publicAt, viewCount fields
  - Add marketplace-related constants (username regex, limits)
  - _Requirements: 1.4, 2.5, 4.5, 6.2_

- [x] 2. Implement username validation service
  - Create username validation functions (format, length, characters)
  - Implement checkUsernameAvailability function with Firestore query
  - Add username suggestion generator for taken usernames
  - Create normalizeUsername function (lowercase for uniqueness)
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for username validation
  - **Property 1: Username uniqueness is enforced**
  - **Property 2: Username format is validated**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [x] 3. Extend authentication to support usernames
  - Update SignUpForm to include username input field with real-time availability checking
  - Modify authService.signUp to accept username parameter
  - Create user document in users collection with username and usernameL fields
  - Create username document in usernames collection on signup
  - Update AuthContext to load username from Firestore user document
  - _Requirements: 1.1, 1.2, 1.5_

- [ ]* 3.1 Write property test for username signup
  - **Property 3: Username is stored on signup**
  - **Validates: Requirements 1.5**

- [x] 4. Implement PublicCDService
  - Create toggleCDPublic function to update isPublic field
  - Implement getPublicCDs with sorting and pagination
  - Create getPublicCD function for single public CD retrieval
  - Implement getCreatorPublicCDs filtered by username
  - Add searchPublicCDs with name matching
  - Create helper to sync publicCDs collection when CD is toggled
  - _Requirements: 2.2, 2.3, 3.1, 3.4, 7.1_

- [ ]* 4.1 Write property test for public toggle
  - **Property 4: Public toggle updates CD visibility**
  - **Property 5: Public status is persisted**
  - **Validates: Requirements 2.2, 2.3, 2.5**

- [ ]* 4.2 Write property test for marketplace filtering
  - **Property 6: Marketplace shows only public CDs**
  - **Validates: Requirements 3.1, 9.1**

- [ ]* 4.3 Write property test for search
  - **Property 17: Search filters by name**
  - **Validates: Requirements 7.1**

- [x] 5. Build public toggle UI component
  - Create PublicToggle component with switch control
  - Add confirmation dialog for making CD public
  - Implement toggle handler calling PublicCDService
  - Create PublicIndicator badge component
  - Add public toggle to CDDetailView header
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 6. Implement AnalyticsService
  - Create recordView function to log CD views
  - Implement getViewAnalytics to retrieve viewer list
  - Add getViewCount for total view count
  - Create hasUserViewed to check if user already viewed
  - Ensure only first view per user is recorded
  - _Requirements: 4.3, 6.1, 6.2, 6.3_

- [ ]* 6.1 Write property test for analytics
  - **Property 10: View analytics records logged-in viewers**
  - **Property 11: Guest views don't create analytics**
  - **Property 15: View analytics shows unique viewers**
  - **Validates: Requirements 4.3, 4.4, 6.3**

- [x] 7. Build marketplace browse page
  - Create MarketplacePage component with grid layout
  - Build PublicCDCard component showing CD info and creator username
  - Implement MarketplaceFilters with search and sort controls
  - Add MarketplaceEmpty state component
  - Integrate PublicCDService to load and display public CDs
  - Implement infinite scroll pagination
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 7.1 Write property test for marketplace display
  - **Property 7: Marketplace displays creator info**
  - **Property 8: Marketplace sorting is correct**
  - **Validates: Requirements 3.2, 3.4**

- [x] 8. Build public CD view page
  - Create PublicCDViewPage component for public access
  - Display creator username prominently
  - Show total view count
  - Record view when logged-in user accesses
  - Allow guest access without recording analytics
  - Add "View Creator Profile" link
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 8.1 Write property test for public CD access
  - **Property 9: Public CDs are accessible to all**
  - **Validates: Requirements 4.1, 4.4**

- [x] 9. Build creator profile page
  - Create CreatorProfilePage component
  - Build ProfileHeader showing username, join date, stats
  - Implement PublicCDList for creator's public CDs
  - Add logic to show all CDs when viewing own profile
  - Show only public CDs when viewing others' profiles
  - Add "Edit Profile" button for own profile
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 9.1 Write property test for profile visibility
  - **Property 12: Profile shows creator's public CDs**
  - **Property 13: Own profile shows all CDs**
  - **Property 14: Other profiles show only public CDs**
  - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 10. Build view analytics UI
  - Create ViewAnalytics component for CD owners
  - Build ViewerList showing usernames and timestamps
  - Add AnalyticsStats summary component
  - Integrate into CDDetailView for public CDs
  - Show only to CD owner
  - _Requirements: 6.1, 6.2, 6.4_

- [ ]* 10.1 Write property test for analytics access
  - **Property 16: Analytics are owner-only**
  - **Validates: Requirements 9.5**

- [x] 11. Implement search and filter functionality
  - Add search input to MarketplaceFilters
  - Implement client-side search filtering by CD name
  - Add sort dropdown (Newest, Oldest, Most Viewed)
  - Implement sort logic in marketplace
  - Add creator filter option
  - Handle empty search results
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 11.1 Write property test for sorting
  - **Property 18: Sort order is correct**
  - **Validates: Requirements 7.3**

- [x] 12. Add marketplace navigation
  - Add "Marketplace" link to main navigation
  - Update navigation highlighting for marketplace page
  - Ensure marketplace is accessible to guests
  - Add marketplace route to App.tsx
  - Create route for creator profiles (/profile/:username)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Implement username management
  - Create ProfileSettings component
  - Add username display and edit functionality
  - Implement updateUsername in UserService
  - Update all CD references when username changes
  - Validate new username for uniqueness
  - Add @ prefix display for usernames
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 13.1 Write property test for username changes
  - **Property 21: Username changes update all references**
  - **Property 22: Username changes preserve analytics**
  - **Validates: Requirements 10.3, 10.4**

- [x] 14. Update Firebase security rules
  - Extend users collection rules for public read access (username, usernameL, publicCDCount)
  - Add usernames collection rules for uniqueness checking (public read, authenticated create/delete)
  - Update cds collection rules to allow public read when isPublic is true
  - Add publicCDs collection rules (public read, no direct writes)
  - Add cdViews collection rules for analytics (owner read, authenticated create/update)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 14.1 Write unit tests for security rules
  - Test users collection public read access
  - Test usernames collection uniqueness enforcement
  - Test public CD read access for guests and authenticated users
  - Test private CD access denial for non-owners
  - Test analytics access control (owner-only)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14.2 Deploy updated security rules to Firebase
  - Deploy firestore.rules using firebase deploy --only firestore:rules
  - Verify rules are active in Firebase console
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 15. Write property test for privacy
  - **Property 19: Private CDs are not in marketplace**
  - **Property 20: Private CDs reject non-owner access**
  - **Validates: Requirements 9.1, 9.2**

- [x] 16. Create Firestore indexes
  - Create firestore.indexes.json file if it doesn't exist
  - Add composite index: publicCDs (publicAt DESC)
  - Add composite index: publicCDs (viewCount DESC)
  - Add composite index: publicCDs (username ASC, publicAt DESC)
  - Add composite index: cdViews/{cdId}/viewers (viewedAt DESC)
  - _Requirements: 3.4, 7.3_

- [x] 16.1 Deploy Firestore indexes
  - Deploy indexes via firebase deploy --only firestore:indexes
  - Verify indexes are created in Firebase console
  - _Requirements: 3.4, 7.3_

- [x] 17. Implement migration for existing users
  - Create UsernamePromptModal component for users without usernames
  - Add migration check in AuthContext on user load
  - Generate suggested usernames from email prefix
  - Block access to public features (marketplace, profile) until username is set
  - Allow access to collection and settings pages for username setup
  - Store migration completion flag to avoid repeated prompts
  - _Requirements: 1.1_

- [ ] 18. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify no regressions in existing functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 19. Write integration tests for public marketplace
  - Test complete public sharing flow: toggle → marketplace → view → analytics
  - Test username signup flow: create → appears on CDs
  - Test profile flow: view → see CDs → click → view contents
  - Test search flow: query → filter → click → view
  - _Requirements: 1.5, 2.2, 3.1, 4.3, 5.3, 7.1_