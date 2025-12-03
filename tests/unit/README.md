# Security Rules Unit Tests

This directory contains unit tests for Firebase Security Rules (Firestore and Storage).

## Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

3. **Start Firebase Emulators**
   
   Before running the tests, you must start the Firebase Emulator Suite:
   ```bash
   firebase emulators:start
   ```
   
   This will start:
   - Firestore Emulator on port 8080
   - Storage Emulator on port 9199
   - Auth Emulator on port 9099
   - Emulator UI on port 4000

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Security Rules Tests Only
```bash
npm run test:security
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Coverage

The security rules tests cover:

### Firestore Security Rules
- ✅ Users collection access control
- ✅ CDs collection owner access
- ✅ CDs collection share token access
- ✅ Files subcollection access control
- ✅ ShareTokens collection access control
- ✅ EmailLogs collection access control
- ✅ Expired token rejection
- ✅ Unauthorized access denial

### Storage Security Rules
- ✅ File type validation (jpg, png, mp3, wav, mp4)
- ✅ File size validation (5MB for videos, 20MB for others)
- ✅ Owner upload permissions
- ✅ Owner read permissions
- ✅ Owner delete permissions
- ✅ Non-owner access denial
- ✅ Thumbnail access control

## Requirements Validated

These tests validate the following requirements:
- **Requirement 9.1**: Owner and share token access verification
- **Requirement 9.2**: Access verification failure handling
- **Requirement 9.5**: Expired share token rejection

## Troubleshooting

### Emulators Not Running
If tests fail with connection errors, ensure the Firebase Emulators are running:
```bash
firebase emulators:start
```

### Port Conflicts
If you have port conflicts, you can modify the ports in `firebase.json`:
```json
{
  "emulators": {
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "auth": { "port": 9099 }
  }
}
```

### Test Timeout
If tests timeout, increase the Jest timeout in `jest.config.js`:
```javascript
testTimeout: 30000 // 30 seconds
```

## Test Structure

Each test follows this pattern:
1. Set up test data using `withSecurityRulesDisabled`
2. Attempt operation with authenticated context
3. Assert success or failure using `assertSucceeds` or `assertFails`
4. Clean up with `beforeEach` hooks

## Adding New Tests

When adding new security rules tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and failure cases
4. Clean up test data in `beforeEach`
5. Reference the requirement being validated in comments
