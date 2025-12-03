# 🚀 Quick Start Guide

Get ReCd(fyi) running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- A Firebase account (free tier works)

## Step 1: Clone & Install (1 min)

```bash
git clone https://github.com/yourusername/recd-platform.git
cd recd-platform
npm install
```

## Step 2: Firebase Setup (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable these services:
   - **Authentication** → Email/Password
   - **Firestore Database** → Production mode
   - **Storage** → Default bucket

4. Get your config:
   - Project Settings → General → Your apps → Web app
   - Copy the config object

## Step 3: Environment Config (1 min)

Copy and configure environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and EmailJS values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (get from emailjs.com)
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=your_key
```

## Step 4: Deploy Security Rules (30 sec)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage:rules
```

## Step 5: Start Development (30 sec)

```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start

# Terminal 2: Start dev server
npm run dev
```

## 🎉 Done!

Open http://localhost:5173 in your browser!

## What's Next?

- 📖 Read the [full README](README.md) for detailed documentation
- 🧪 Run tests: `npm test`
- 🎨 Explore the Y2K aesthetic
- 💿 Create your first virtual CD!

## Troubleshooting

**Port already in use?**
```bash
# Kill processes on ports
lsof -ti:5173 | xargs kill -9
lsof -ti:9099 | xargs kill -9
```

**Firebase connection issues?**
- Double-check your `.env.local` values
- Ensure Firebase services are enabled
- Verify security rules are deployed

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Need Help?

- 📚 [Full Setup Guide](SETUP.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 📖 [Documentation](docs/README.md)
- 🐛 [Report Issues](https://github.com/yourusername/recd-platform/issues)

---

**Built with 💿 and [Kiro AI](https://kiro.ai)**
