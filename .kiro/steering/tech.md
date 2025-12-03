# Technology Stack

## Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: React Context API + hooks
- **Styling**: CSS Modules with retro/Y2K theme variables

## Backend Services

- **Authentication**: Firebase Authentication (email/password)
- **Database**: Cloud Firestore (NoSQL)
- **File Storage**: Firebase Cloud Storage
- **Email**: Direct SMTP from frontend (with email logs stored in Firestore)
- **Hosting**: Vercel

## Testing

- **Unit Tests**: Jest + React Testing Library
- **Property Tests**: fast-check (minimum 100 iterations per property)
- **Integration Tests**: Firebase Emulator Suite
- **Security Rules Tests**: @firebase/rules-unit-testing
- **Coverage Target**: 80% for core business logic

## Development Tools

- **Local Development**: Firebase Emulator Suite
- **Package Manager**: npm
- **TypeScript**: Strict mode enabled

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Firebase emulators
firebase emulators:start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run property tests
npm run test:property

# Run integration tests
npm run test:integration
```

### Build & Deploy
```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel deploy

# Deploy Firebase security rules only
firebase deploy --only firestore:rules,storage:rules
```

## Key Dependencies

- `firebase`: Firebase SDK
- `react-router-dom`: Client-side routing
- `fast-check`: Property-based testing
- `jszip`: Zip file generation for CD downloads
- `@firebase/rules-unit-testing`: Security rules testing
- `nodemailer` or `emailjs-com`: SMTP email sending from frontend

## Environment Configuration

Firebase configuration should be stored in environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

SMTP configuration for email sending:
- `VITE_SMTP_HOST`
- `VITE_SMTP_PORT`
- `VITE_SMTP_USER`
- `VITE_SMTP_PASS`
- `VITE_SMTP_FROM_EMAIL`
