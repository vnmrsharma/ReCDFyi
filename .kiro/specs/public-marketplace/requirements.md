# Requirements Document: Public CD Marketplace

## Introduction

The Public CD Marketplace feature transforms ReCd(fyi) from a private sharing platform into a social discovery platform where users can publicly share their CDs with the entire community. This creates a data marketplace where creators showcase their curated media collections and consumers discover new content. The feature includes username-based identity, public CD listings, view analytics, and a browsable marketplace interface.

## Glossary

- **Username**: A unique, user-chosen identifier displayed publicly (e.g., @musiclover123)
- **Public_CD**: A CD that has been marked as publicly discoverable in the marketplace
- **Marketplace**: The public browse page where all Public_CDs are listed
- **Creator_Profile**: A public page showing a user's username, public CDs, and stats
- **View_Analytics**: Data tracking which users have accessed a Public_CD
- **Discovery_Feed**: The main marketplace interface showing public CDs with filtering/sorting
- **Public_Toggle**: A setting that makes a CD publicly visible or keeps it private
- **View_Record**: A log entry recording when a user views a Public_CD

## Requirements

### Requirement 1: Username System

**User Story:** As a new user, I want to choose a unique username during signup, so that I have a public identity when sharing CDs.

#### Acceptance Criteria

1. WHEN a user signs up THEN the ReCd_System SHALL require a username in addition to email and password
2. WHEN a user submits a username THEN the ReCd_System SHALL validate that it is unique across all users
3. WHEN a username is already taken THEN the ReCd_System SHALL display an error and suggest alternatives
4. WHEN a username is created THEN the ReCd_System SHALL enforce rules: 3-20 characters, alphanumeric plus underscore, no spaces
5. WHEN a user completes signup with a valid username THEN the ReCd_System SHALL store the username in the user profile

### Requirement 2: Public CD Toggle

**User Story:** As a CD owner, I want to toggle my CD between public and private, so that I can control whether it appears in the marketplace.

#### Acceptance Criteria

1. WHEN viewing a CD I own THEN the ReCd_System SHALL display a public/private toggle control
2. WHEN I toggle a CD to public THEN the ReCd_System SHALL add it to the public marketplace listings
3. WHEN I toggle a CD to private THEN the ReCd_System SHALL remove it from the public marketplace immediately
4. WHEN a CD is public THEN the ReCd_System SHALL display a visual indicator showing its public status
5. WHEN a CD is toggled THEN the ReCd_System SHALL update the CD metadata with the new visibility status

### Requirement 3: Public Marketplace Browse

**User Story:** As any user, I want to browse a marketplace of public CDs, so that I can discover content shared by the community.

#### Acceptance Criteria

1. WHEN I navigate to the marketplace page THEN the ReCd_System SHALL display all public CDs in a grid layout
2. WHEN displaying public CDs THEN the ReCd_System SHALL show CD name, creator username, file count, and creation date
3. WHEN I click on a public CD THEN the ReCd_System SHALL navigate to the public CD view page
4. WHEN the marketplace loads THEN the ReCd_System SHALL sort CDs by most recently made public first
5. WHEN there are no public CDs THEN the ReCd_System SHALL display an empty state encouraging users to share

### Requirement 4: Public CD View

**User Story:** As any user, I want to view and download files from a public CD, so that I can access content shared by creators.

#### Acceptance Criteria

1. WHEN I access a public CD THEN the ReCd_System SHALL display all files with preview and download options
2. WHEN viewing a public CD THEN the ReCd_System SHALL display the creator's username prominently
3. WHEN I view a public CD THEN the ReCd_System SHALL record my username in the view analytics if I am logged in
4. WHEN I view a public CD as a guest THEN the ReCd_System SHALL allow access but not record analytics
5. WHEN viewing a public CD THEN the ReCd_System SHALL show the total view count

### Requirement 5: Creator Profile Page

**User Story:** As any user, I want to view a creator's profile, so that I can see all their public CDs and stats.

#### Acceptance Criteria

1. WHEN I click on a creator's username THEN the ReCd_System SHALL navigate to their profile page
2. WHEN viewing a profile THEN the ReCd_System SHALL display the username, join date, and total public CDs count
3. WHEN viewing a profile THEN the ReCd_System SHALL list all of that creator's public CDs
4. WHEN viewing my own profile THEN the ReCd_System SHALL show both public and private CDs
5. WHEN viewing another user's profile THEN the ReCd_System SHALL show only their public CDs

### Requirement 6: View Analytics for Creators

**User Story:** As a CD creator, I want to see who has viewed my public CDs, so that I can understand my audience.

#### Acceptance Criteria

1. WHEN I view my own public CD THEN the ReCd_System SHALL display a list of usernames who have viewed it
2. WHEN displaying view analytics THEN the ReCd_System SHALL show username and timestamp of each view
3. WHEN a user views my public CD multiple times THEN the ReCd_System SHALL record only the first view per user
4. WHEN viewing analytics THEN the ReCd_System SHALL display the total unique viewer count
5. WHEN a guest views my public CD THEN the ReCd_System SHALL not add them to the analytics list

### Requirement 7: Marketplace Search and Filter

**User Story:** As a marketplace browser, I want to search and filter public CDs, so that I can find specific content.

#### Acceptance Criteria

1. WHEN I enter a search query THEN the ReCd_System SHALL filter CDs by name matching the query
2. WHEN I select a creator filter THEN the ReCd_System SHALL show only CDs from that creator
3. WHEN I select a sort option THEN the ReCd_System SHALL reorder CDs by newest, oldest, or most viewed
4. WHEN search returns no results THEN the ReCd_System SHALL display a helpful message
5. WHEN I clear filters THEN the ReCd_System SHALL return to showing all public CDs

### Requirement 8: Navigation Integration

**User Story:** As a user, I want easy access to the marketplace from the main navigation, so that I can quickly browse public content.

#### Acceptance Criteria

1. WHEN I am on any page THEN the ReCd_System SHALL display a "Marketplace" link in the main navigation
2. WHEN I click the Marketplace link THEN the ReCd_System SHALL navigate to the marketplace browse page
3. WHEN I am on the marketplace page THEN the ReCd_System SHALL highlight the Marketplace nav item
4. WHEN I am logged in THEN the ReCd_System SHALL show both "My CDs" and "Marketplace" navigation options
5. WHEN I am not logged in THEN the ReCd_System SHALL still allow access to the marketplace as a guest

### Requirement 9: Privacy and Security

**User Story:** As a user, I want my private CDs to remain private, so that only intended recipients can access them.

#### Acceptance Criteria

1. WHEN a CD is private THEN the ReCd_System SHALL not include it in marketplace listings
2. WHEN a CD is private THEN the ReCd_System SHALL not allow direct URL access from non-owners
3. WHEN a CD is public THEN the ReCd_System SHALL allow any user to view it via marketplace or direct URL
4. WHEN I delete a public CD THEN the ReCd_System SHALL remove it from the marketplace immediately
5. WHEN viewing analytics THEN the ReCd_System SHALL only show this data to the CD owner

### Requirement 10: Username Management

**User Story:** As a user, I want to view and potentially update my username, so that I can maintain my public identity.

#### Acceptance Criteria

1. WHEN I access my profile settings THEN the ReCd_System SHALL display my current username
2. WHEN I attempt to change my username THEN the ReCd_System SHALL validate the new username for uniqueness
3. WHEN I change my username THEN the ReCd_System SHALL update all references to my username across public CDs
4. WHEN I change my username THEN the ReCd_System SHALL maintain my view analytics history
5. WHEN displaying my username THEN the ReCd_System SHALL show it with an @ prefix (e.g., @username)

