# HSTU Research Society — Admin Dashboard

This is the official administrative dashboard for the HSTU Research Society. It is built using **Next.js (App Router)** and **Firebase (Firestore & Authentication)**.

## 🚀 Features

- **Dashboard**: Overview of membership and activities.
- **Resource Management**: 13+ modules for Library, Opportunities, and Learning.
- **Research Hub**: Management of Publications, Projects, Magazine, and Collaboration Board.
- **Media & Blog**: CRUD for Research Articles, Tutorials, Tech Insights, and Gallery Albums/Photos/Videos.
- **Events**: Automated Upcoming/Past event tracking with detailed reporting.
- **Verification**: Secure ID-based verification for Membership, Certificates, and Volunteership.
- **Community**: Volunteer calls, Application review, and Partnerships management.
- **FAQ**: Fully manageable FAQ section.

## 🛠️ Technology Stack

- **Framework**: Next.js
- **Backend**: Firebase Firestore
- **Authentication**: Google OAuth
- **Styling**: Vanilla CSS (shared design system)

## 📦 Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Configure Environment Variables (`.env.local`):
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```
4.  Run development server: `npm run dev`.

---
© 2026 HSTU Research Society
