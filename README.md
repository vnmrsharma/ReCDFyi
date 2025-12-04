# 💿 ReCd(fyi) - Virtual CD Burning Platform

**Relive the Y2K era of CD burning and sharing with modern technology**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-FFCA28?style=flat-square)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

🌐 **Live Demo**: [https://recd-fyi.vercel.app/](https://recd-fyi.vercel.app/)


## What is ReCd?

ReCd is a nostalgic virtual CD burning and sharing platform that recreates the experience of the early 2000s. Create virtual CDs (20 MB each), upload media files with retro burning animations, and share them with friends just like the good old days.

### ✨ Key Features

- **💿 Virtual CD Burning** - Create CDs with authentic Y2K burning animations
- **🤖 AI-Powered Metadata** - Smart tagging using Google Gemini 2.0 Flash
- **📧 Easy Sharing** - Share via email or links (30-day expiration)
- **🌐 Public Marketplace** - Browse and discover CDs from other creators
- **🎨 Y2K Aesthetic** - Authentic Windows 98/XP retro design
- **🔒 Privacy-First** - Private by default, public by choice
- **⚡ Serverless** - Fast, reliable Firebase backend

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Firebase account (free tier works)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/vnmrsharma/ReCDFyi.git
   cd ReCDFyi
   npm install
   ```

2. **Set up Firebase**
   - Create project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Storage

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # Firebase (Required)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # EmailJS (Optional - for email sharing)
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   
   # Google Gemini AI (Optional - for smart metadata)
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Deploy Firebase rules**
   ```bash
   firebase login
   firebase deploy --only firestore:rules,storage:rules
   ```

5. **Start development**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173)

## 🤖 AI Metadata Feature

ReCd uses **Google Gemini 2.0 Flash** to automatically generate smart metadata when CDs are made public:

### How It Works
1. Upload files with descriptive names (e.g., `sunset_beach_2024.jpg`)
2. Toggle CD to public
3. AI analyzes filenames and generates tags
4. Metadata appears in retro Y2K style
5. Enhanced search makes your CD discoverable

### Setup Gemini API
1. Get free API key: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Add to `.env.local`: `VITE_GEMINI_API_KEY=your_key`
3. Restart dev server

**Free Tier**: 1,500 requests/day (~150 CDs/day)  
**Cost**: ~$0.0001 per CD (if you exceed free tier)

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini 2.0 Flash
- **Email**: EmailJS
- **Hosting**: Vercel
- **Testing**: Jest, React Testing Library, fast-check

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Pages    │  │ Components │  │   Services Layer       │ │
│  │  (Routes)  │→ │   (UI)     │→ │ (Business Logic)       │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ Firebase │ │  Gemini  │ │ EmailJS  │
         │          │ │   API    │ │   SMTP   │
         └────┬─────┘ └──────────┘ └──────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐┌────────┐┌────────┐
│  Auth  ││Firestore││Storage │
│        ││Database ││ Bucket │
└────────┘└────────┘└────────┘
```

### Data Flow

```
User Action → React Component → Service Layer → Firebase/Gemini
                                                      ↓
User sees result ← React State Update ← Response ←───┘
```

### AI Metadata Flow

```
Toggle CD Public → Update Firestore → Trigger AI Generation
                                              ↓
                                    Fetch Files Metadata
                                              ↓
                                    For Each File:
                                      - Build Prompt
                                      - Call Gemini API
                                      - Parse Response
                                      - Save to Firestore
                                              ↓
                                    Mark CD Complete
                                              ↓
                                    Display in Y2K UI
```

## 📁 Project Structure

```
recd-platform/
├── src/
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── PasswordResetForm.tsx
│   │   │   ├── UsernamePromptModal.tsx
│   │   │   ├── AuthWindow.tsx
│   │   │   ├── AnimatedBackground.tsx
│   │   │   └── DecorativeElements.tsx
│   │   ├── cd/                 # CD management components
│   │   │   ├── CDCard.tsx
│   │   │   ├── CDCollection.tsx
│   │   │   ├── CDDetailView.tsx
│   │   │   ├── CreateCDModal.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── PublicToggle.tsx
│   │   │   ├── PublicIndicator.tsx
│   │   │   ├── PublicCDCard.tsx
│   │   │   ├── AIMetadataDisplay.tsx      # AI metadata UI
│   │   │   ├── MetadataGenerationModal.tsx # Progress modal
│   │   │   ├── ViewAnalytics.tsx
│   │   │   ├── AnalyticsStats.tsx
│   │   │   ├── ViewerList.tsx
│   │   │   ├── MarketplaceFilters.tsx
│   │   │   └── MarketplaceEmpty.tsx
│   │   ├── upload/             # File upload components
│   │   │   ├── FileUploader.tsx
│   │   │   └── BurningProgress.tsx
│   │   ├── share/              # Sharing components
│   │   │   ├── ShareModal.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── ShareLinkDisplay.tsx
│   │   │   ├── EmailShareForm.tsx
│   │   │   ├── SharedCDView.tsx
│   │   │   └── GuestPromptModal.tsx
│   │   ├── preview/            # Media preview components
│   │   │   ├── FilePreviewModal.tsx
│   │   │   ├── ImageViewer.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── RetroButton.tsx
│   │   │   ├── RetroLayout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── DiscAnimation.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── routing/            # Route protection
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── PublicRoute.tsx
│   │   └── user/               # User profile components
│   │       └── ProfileSettings.tsx
│   ├── services/               # Business logic & Firebase
│   │   ├── authService.ts      # Authentication
│   │   ├── cdService.ts        # CD CRUD operations
│   │   ├── fileService.ts      # File upload/download
│   │   ├── shareService.ts     # Share token management
│   │   ├── emailService.ts     # Email sending
│   │   ├── publicCDService.ts  # Public marketplace
│   │   ├── userService.ts      # User profiles
│   │   ├── analyticsService.ts # View tracking
│   │   ├── validationService.ts # Input validation
│   │   ├── aiService.ts        # Gemini AI integration
│   │   ├── cdMetadataService.ts # AI metadata orchestration
│   │   └── searchService.ts    # Enhanced search
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useReducedMotion.ts
│   │   └── useMetadataGeneration.ts # AI metadata hook
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.tsx
│   ├── pages/                  # Route components
│   │   ├── LandingPage.tsx     # Public landing page
│   │   ├── AuthPage.tsx        # Login/signup
│   │   ├── CollectionPage.tsx  # User's CDs
│   │   ├── CDDetailPage.tsx    # CD details
│   │   ├── SharedCDPage.tsx    # Guest CD view
│   │   ├── MarketplacePage.tsx # Public CDs
│   │   ├── PublicCDViewPage.tsx # Public CD details
│   │   ├── CreatorProfilePage.tsx # Creator profile
│   │   ├── SettingsPage.tsx    # User settings
│   │   ├── AboutPage.tsx       # About us
│   │   ├── HelpPage.tsx        # Help & FAQ
│   │   ├── PrivacyPage.tsx     # Privacy policy
│   │   ├── TermsPage.tsx       # Terms of service
│   │   └── NotFoundPage.tsx    # 404 page
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts            # All type definitions
│   ├── utils/                  # Utility functions
│   │   ├── constants.ts        # App constants
│   │   ├── errorHandling.ts    # Error utilities
│   │   ├── tokenGenerator.ts   # Token generation
│   │   ├── zipGenerator.ts     # ZIP file creation
│   │   └── linkHelpers.ts      # URL helpers
│   ├── styles/                 # Global styles
│   │   └── index.css
│   ├── config/                 # Configuration
│   │   └── firebase.ts         # Firebase config
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── docs/                       # Documentation
│   ├── AI_METADATA_FEATURE.md
│   ├── GEMINI_SETUP_GUIDE.md
│   ├── AI_METADATA_MIGRATION.md
│   ├── AI_METADATA_FLOW_DIAGRAM.md
│   ├── AI_METADATA_UI_GUIDE.md
│   ├── CORS_FIX_NOTE.md
│   └── implementation-notes/
│       └── AUTH_ACCESSIBILITY_IMPROVEMENTS.md
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   ├── property/               # Property-based tests
│   └── integration/            # Integration tests
├── public/                     # Static assets
│   └── vite.svg
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security
├── firestore.indexes.json      # Firestore indexes
├── storage.rules               # Storage security
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── jest.config.js              # Jest configuration
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies
├── package-lock.json           # Lock file
├── vercel.json                 # Vercel deployment
└── README.md                   # This file
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run security rules tests
npm run test:security
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Deploy

### Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built with [Kiro AI](https://kiro.ai)
- Powered by Firebase & Google Gemini
- Inspired by the golden age of CD burning

**Made with 💿 and nostalgia**

[Start Burning CDs →](https://recd-fyi.vercel.app/)
