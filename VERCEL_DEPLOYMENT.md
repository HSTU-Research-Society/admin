# Vercel Deployment Guide — HSTU Research Society Admin

This guide provides step-by-step instructions for deploying the Admin Dashboard to Vercel.

## 📋 Prerequisites

- A [Vercel](https://vercel.com) account.
- Access to the GitHub repository.
- Firebase project credentials.

## 🚀 Deployment Steps

### 1. Connect Repository
1. Log in to Vercel and click **Add New** > **Project**.
2. Import the `hsturs/admin` repository.

### 2. Configure Project
- **Framework Preset**: Next.js (should be automatically detected).
- **Root Directory**: `./` (default).

### 3. Set Environment Variables
This is the most critical step. Copy all values from your local `.env.local` to the Vercel **Environment Variables** section:

| Variable Name | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g. project-id.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g. project-id.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Numerical ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Identifies the web app |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics ID |

> [!IMPORTANT]
> Ensure all variable names start with `NEXT_PUBLIC_` so they are accessible on the client side.

### 4. Deploy
Click **Deploy**. Vercel will build the project and provide a production URL.

## 🛡️ Security Post-Deployment

### 1. Update Firebase Trusted Domains
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Settings** > **Authorized domains**.
3. Add your Vercel deployment domain (e.g., `hstu-admin.vercel.app`) to the list.

### 2. Configure Firestore Security Rules
Ensure your Firestore rules are locked down. Example basic rule for admin access:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---
© 2026 HSTU Research Society
