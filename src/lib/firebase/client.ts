import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCNZWzG1IS5ro6btgG-fVWz8miXFaMmX50",
  authDomain: "hstu-research-society.firebaseapp.com",
  projectId: "hstu-research-society",
  storageBucket: "hstu-research-society.firebasestorage.app",
  messagingSenderId: "951289168954",
  appId: "1:951289168954:web:f21e51d3f0707b2351e103",
  measurementId: "G-EDT5CSV37Q"
};

// Initialize Firebase only if there are no instantiated apps
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics is only available in the browser context
// let analytics;
// if (typeof window !== "undefined") {
//   analytics = getAnalytics(app);
// }

export { app, auth, db };
