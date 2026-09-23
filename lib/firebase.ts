import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtkxZ_nEZoawnRtVyMk9joOZiny1DMxgs",
  authDomain: "lms-sys-38d8f.firebaseapp.com",
  projectId: "lms-sys-38d8f",
  storageBucket: "lms-sys-38d8f.firebasestorage.app",
  messagingSenderId: "1050165058586",
  appId: "1:1050165058586:web:18553f772465b6422045a3",
  measurementId: "G-X9LKH8CM8R"
};

// Initialize Firebase (checking if it already exists to prevent Next.js SSR errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics safely for Next.js (Analytics only runs in the browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Auth and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export them so your RegisterPage can use them
export { app, auth, googleProvider };