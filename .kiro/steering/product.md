# Product Overview

ReCd(fyi) is a serverless virtual CD media sharing platform that recreates the nostalgic experience of burning and sharing CDs from the early 2000s.

## Core Features

- Create virtual "CDs" with 20 MB storage capacity per disc
- Upload media files (images, audio, small videos) with retro burning animations
- Share CDs via email or shareable links with 30-day expiration
- Guest access for recipients without requiring authentication
- Y2K aesthetic with CD-tray animations and disc-insert/eject effects

## User Experience

The platform embraces a retro early-2000s CD burning software aesthetic with:
- Fixed-width layout with Y2K-era styling
- Disc animations (insert/eject, spinning)
- Burning progress bars during uploads
- 3D button effects and retro fonts

## Technical Approach

Fully serverless architecture leveraging Firebase services:
- Firebase Authentication for user management
- Firestore for metadata storage
- Firebase Storage for media files
- Direct SMTP email sending from frontend with logs stored in Firestore
- Security enforced through Firebase Security Rules
- Hosted on Vercel for optimal performance

## Code Quality Standards

The codebase must be:
- **Modular**: Clear separation of concerns with well-defined module boundaries
- **Component-based**: Reusable, single-responsibility components
- **Clean**: Readable code with consistent naming and formatting
- **Maintainable**: Easy to understand, extend, and debug
- **Type-safe**: Full TypeScript coverage with strict mode
