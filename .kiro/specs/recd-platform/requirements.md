# Requirements Document

## Introduction

ReCd(fyi) is a virtual CD media sharing platform that recreates the nostalgic experience of burning and sharing CDs from the early 2000s. The platform allows users to create virtual "CDs" (disc containers), upload media files with a 20 MB storage limit per disc, and share these discs with friends via email or shareable links. The application is fully serverless, leveraging Firebase services for authentication, storage, and database, combined with an email API for sharing functionality. The user interface embraces a retro Y2K aesthetic with CD-tray animations, disc-insert/eject effects, and a burning progress experience.

## Glossary

- **ReCd_System**: The complete virtual CD media sharing platform
- **User**: An authenticated person using the platform to create, manage, and share CDs
- **CD**: A virtual disc container object that holds media files, with a maximum storage capacity of 20 MB
- **Media_File**: An uploaded file (image, audio, or small video) stored within a CD
- **Share_Token**: A secure, time-limited token that grants access to a specific CD
- **Recipient**: A person who receives a share link to access a CD
- **Firebase_Auth**: Firebase Authentication service for user management
- **Firestore**: Firebase's NoSQL database for storing CD metadata and user data
- **Firebase_Storage**: Firebase's cloud storage service for storing media files
- **Email_API**: A managed email service (SendGrid, Mailgun, etc.) for sending share links
- **Burning**: The process of uploading media files to a CD, presented with retro UI animations
- **Guest_Access**: Limited access mode allowing recipients to view and download shared CDs without full authentication

## Requirements

### Requirement 1

**User Story:** As a new visitor, I want to sign up for an account, so that I can create and manage my own virtual CDs.

#### Acceptance Criteria

1. WHEN a visitor accesses the sign-up page THEN the ReCd_System SHALL display a registration form requesting email and password
2. WHEN a visitor submits valid credentials THEN the ReCd_System SHALL create a new user account via Firebase_Auth
3. WHEN a visitor submits invalid credentials THEN the ReCd_System SHALL display specific validation errors and prevent account creation
4. WHEN account creation succeeds THEN the ReCd_System SHALL authenticate the user and redirect to the CD collection view
5. WHEN a visitor attempts to sign up with an already-registered email THEN the ReCd_System SHALL display an error message indicating the email is already in use

### Requirement 2

**User Story:** As a registered user, I want to log in to my account, so that I can access my CD collection and manage my discs.

#### Acceptance Criteria

1. WHEN a user accesses the login page THEN the ReCd_System SHALL display a login form requesting email and password
2. WHEN a user submits valid credentials THEN the ReCd_System SHALL authenticate via Firebase_Auth and grant access to the user's account
3. WHEN a user submits invalid credentials THEN the ReCd_System SHALL display an authentication error and prevent access
4. WHEN authentication succeeds THEN the ReCd_System SHALL redirect the user to their CD collection view
5. WHEN a user requests password reset THEN the ReCd_System SHALL send a password reset email via Firebase_Auth

### Requirement 3

**User Story:** As an authenticated user, I want to create new virtual CDs, so that I can organize and store my media files in separate disc containers.

#### Acceptance Criteria

1. WHEN a user initiates CD creation THEN the ReCd_System SHALL display a form requesting CD name and optional label metadata
2. WHEN a user submits the CD creation form THEN the ReCd_System SHALL create a new CD document in Firestore with initial storage usage of 0 MB
3. WHEN a CD is created THEN the ReCd_System SHALL assign a unique identifier to the CD and associate it with the user's account
4. WHEN a CD is created THEN the ReCd_System SHALL initialize the CD with a 20 MB storage limit
5. WHEN CD creation completes THEN the ReCd_System SHALL display the new CD in the user's collection view with disc icon and metadata

### Requirement 4

**User Story:** As a user, I want to upload media files to my CDs, so that I can store and organize my images, audio, and videos in a nostalgic disc format.

#### Acceptance Criteria

1. WHEN a user selects files for upload THEN the ReCd_System SHALL validate each file type against allowed formats (jpg, png, mp3, wav, mp4)
2. WHEN a user uploads files THEN the ReCd_System SHALL calculate the total size and verify it does not exceed the CD's remaining storage capacity
3. WHEN the total upload size exceeds the CD's remaining capacity THEN the ReCd_System SHALL reject the upload and display a friendly error message indicating insufficient space
4. WHEN files pass validation THEN the ReCd_System SHALL upload each Media_File to Firebase_Storage in a user-specific and CD-specific folder path
5. WHEN each file uploads successfully THEN the ReCd_System SHALL create a metadata document in Firestore containing filename, file type, size, and upload timestamp
6. WHEN files are uploading THEN the ReCd_System SHALL display a burning progress bar and disc-insert animation reflecting upload progress
7. WHEN all files complete uploading THEN the ReCd_System SHALL update the CD's total storage usage in Firestore

### Requirement 5

**User Story:** As a user, I want to see my collection of CDs in a visual disc-based interface, so that I can easily browse and select which disc to manage.

#### Acceptance Criteria

1. WHEN a user accesses their collection view THEN the ReCd_System SHALL retrieve all CDs associated with the user from Firestore
2. WHEN displaying the collection THEN the ReCd_System SHALL render each CD as a disc icon with visible metadata including disc name, used storage, remaining storage, and creation date
3. WHEN a user clicks on a CD icon THEN the ReCd_System SHALL navigate to the detailed disc view for that CD
4. WHEN the collection is empty THEN the ReCd_System SHALL display an empty state with a prompt to create the first CD
5. WHEN CDs are displayed THEN the ReCd_System SHALL sort them by creation date with newest first

### Requirement 6

**User Story:** As a user, I want to view the contents of a CD, so that I can see all the media files I've stored on that disc and manage them.

#### Acceptance Criteria

1. WHEN a user opens a CD THEN the ReCd_System SHALL retrieve all Media_File metadata for that CD from Firestore
2. WHEN displaying CD contents THEN the ReCd_System SHALL render each file with a thumbnail (for images), filename, file type, and file size
3. WHEN a user clicks on a file THEN the ReCd_System SHALL display a preview modal appropriate for the file type (image viewer, audio player, video player)
4. WHEN a user requests to download a single file THEN the ReCd_System SHALL generate a download URL from Firebase_Storage and initiate the download
5. WHEN a user requests to download the entire CD THEN the ReCd_System SHALL generate a zip archive containing all files and initiate the download

### Requirement 7

**User Story:** As a user, I want to share my CDs with friends via email or link, so that they can access and download the media I've curated.

#### Acceptance Criteria

1. WHEN a user initiates sharing for a CD THEN the ReCd_System SHALL display a share dialog with options to enter recipient email or copy a share link
2. WHEN a user enters a recipient email and confirms THEN the ReCd_System SHALL generate a unique Share_Token with a 30-day expiration
3. WHEN a Share_Token is generated THEN the ReCd_System SHALL store the token in Firestore associated with the CD, including creation timestamp and expiration date
4. WHEN a user sends via email THEN the ReCd_System SHALL call the Email_API to send a message containing the share link with Share_Token to the recipient
5. WHEN a user requests a copy link THEN the ReCd_System SHALL generate the share URL with Share_Token and copy it to the clipboard

### Requirement 8

**User Story:** As a recipient, I want to access a shared CD via the link I received, so that I can view and download the media files my friend shared with me.

#### Acceptance Criteria

1. WHEN a Recipient accesses a share link THEN the ReCd_System SHALL extract and validate the Share_Token from the URL
2. WHEN the Share_Token is valid and not expired THEN the ReCd_System SHALL grant access to the CD contents
3. WHEN the Share_Token is invalid or expired THEN the ReCd_System SHALL display an error message indicating the link is no longer valid
4. WHEN a Recipient has valid access THEN the ReCd_System SHALL display the CD contents with options to preview and download files
5. WHEN a Recipient is not authenticated THEN the ReCd_System SHALL allow Guest_Access to view and download without requiring login

### Requirement 9

**User Story:** As a system administrator, I want strict access control on CDs, so that only authorized users can access media files and prevent unauthorized public access.

#### Acceptance Criteria

1. WHEN a user attempts to access a CD THEN the ReCd_System SHALL verify the user is either the owner or possesses a valid Share_Token
2. WHEN access verification fails THEN the ReCd_System SHALL deny access and return an authorization error
3. WHEN files are stored in Firebase_Storage THEN the ReCd_System SHALL enforce security rules preventing direct public URL access
4. WHEN Firestore documents are accessed THEN the ReCd_System SHALL enforce security rules allowing read access only to owners or valid Share_Token holders
5. WHEN a Share_Token expires THEN the ReCd_System SHALL automatically revoke access for that token

### Requirement 10

**User Story:** As a user, I want the interface to have a retro early-2000s CD software aesthetic, so that I can enjoy a nostalgic and fun experience while managing my media.

#### Acceptance Criteria

1. WHEN the application loads THEN the ReCd_System SHALL render the interface with Y2K-era styling including retro fonts, fixed-width layout, and CD-themed icons
2. WHEN a user uploads files THEN the ReCd_System SHALL display a burning animation with progress bar resembling CD burning software
3. WHEN a user opens or closes a CD THEN the ReCd_System SHALL play disc-insert or disc-eject animations
4. WHEN the interface is viewed on modern browsers THEN the ReCd_System SHALL maintain the retro aesthetic while ensuring functional compatibility
5. WHEN accessed on slow devices or browsers THEN the ReCd_System SHALL provide a responsive fallback with basic upload and download flows without complex animations

### Requirement 11

**User Story:** As a user, I want clear feedback when errors occur, so that I understand what went wrong and how to resolve the issue.

#### Acceptance Criteria

1. WHEN a file upload fails THEN the ReCd_System SHALL display an error message indicating the specific failure reason (size limit, invalid type, network error)
2. WHEN a user attempts to upload beyond the 20 MB limit THEN the ReCd_System SHALL display a friendly error message showing current usage and remaining capacity
3. WHEN authentication fails THEN the ReCd_System SHALL display a clear error message without exposing sensitive security information
4. WHEN a share link is invalid THEN the ReCd_System SHALL display a helpful error message suggesting the link may have expired
5. WHEN network errors occur THEN the ReCd_System SHALL display a retry option and indicate the operation can be attempted again

### Requirement 12

**User Story:** As a developer, I want the codebase to be modular and well-structured, so that the platform is maintainable and can be easily extended with new features.

#### Acceptance Criteria

1. WHEN the codebase is organized THEN the ReCd_System SHALL separate concerns into distinct modules for authentication, storage, sharing, and UI components
2. WHEN new features are added THEN the ReCd_System SHALL allow extension without requiring modifications to core modules
3. WHEN Firebase security rules are defined THEN the ReCd_System SHALL document the rules clearly with comments explaining access control logic
4. WHEN the data schema is implemented THEN the ReCd_System SHALL document the Firestore collection structure and Firebase_Storage folder hierarchy
5. WHEN the project is delivered THEN the ReCd_System SHALL include a README with setup instructions, architecture overview, and share-link flow documentation
