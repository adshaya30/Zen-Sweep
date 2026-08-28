# Zen Sweep - Firebase Backend

Serverless backend for Zen Sweep powered by **Firebase Cloud Functions (2nd Gen)**, **Firebase Authentication**, and **Cloud Firestore**.

---

## 1. Architecture & Services

- **Firebase Authentication**: Manages user identity via Email/Password and Google OAuth.
- **Firebase Cloud Functions (v2 / TypeScript)**: Serverless microservices running on Node.js 20 runtime.
- **Cloud Firestore**: Real-time NoSQL cloud database storing user profiles, blocking sessions, mood history, and digital wellbeing insights.
- **Firebase Storage**: Stores user avatar images, audio/video assets for mindfulness breathing sessions.

---

## 2. Directory Structure

```
backend/
├── .firebaserc           # Firebase project alias mapping (zen-sweep)
├── firebase.json         # Firebase deployment & emulator configuration
├── functions/
│   ├── src/
│   │   └── index.ts      # Cloud Functions entrypoint & HTTP/Event triggers
│   ├── package.json      # Dependencies (firebase-admin, firebase-functions v2)
│   └── tsconfig.json     # TypeScript compilation settings
└── README.md             # This documentation
```

---

## 3. Prerequisites

1. **Node.js**: Version `20.x` or higher.
2. **Firebase CLI**: Install globally via npm:
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase Account**: Access to the `zen-sweep` project on [Firebase Console](https://console.firebase.google.com/).

---

## 4. Setup & Installation

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Set Active Project
```bash
firebase use zen-sweep
```

### Step 3: Install Functions Dependencies
```bash
cd backend/functions
npm install
```

---

## 5. Local Development & Emulators

You can run the Firebase backend and emulators locally without deploying to production:

```bash
cd backend/functions
npm run serve
```

Or start the full Firebase Emulator Suite:
```bash
cd backend
firebase emulators:start
```

- **Functions Emulator**: `http://127.0.0.1:5001/zen-sweep/us-central1/helloZenSweep`
- **Emulator UI**: `http://127.0.0.1:4000`

---

## 6. Deploying to Production

To build TypeScript and deploy Cloud Functions to Firebase:

```bash
cd backend/functions
npm run build

cd ..
firebase deploy --only functions
```

To deploy Firestore security rules and indexes:
```bash
firebase deploy --only firestore
```

---

## 7. How the Backend Works with the Mobile App

1. **Authentication Flow**:
   - The React Native mobile frontend authenticates users with Firebase Auth (`authService.ts`).
   - On signup or Google OAuth, a user identity record (`uid`) is created in Firebase Auth.
2. **Cloud Functions**:
   - Provide secure server-side logic, scheduled digital wellbeing summaries, and data processing hooks.
3. **Data Security**:
   - Access to Firestore documents is protected using Firebase Security Rules matching the authenticated `request.auth.uid`.
