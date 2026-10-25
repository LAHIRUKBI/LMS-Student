// @/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  indexedDBLocalPersistence 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtkxZ_nEZoawnRtVyMk9joOZiny1DMxgs",
  authDomain: "lms-sys-38d8f.firebaseapp.com",
  projectId: "lms-sys-38d8f",
  storageBucket: "lms-sys-38d8f.firebasestorage.app",
  messagingSenderId: "1050165058586",
  appId: "1:1050165058586:web:18553f772465b6422045a3",
  measurementId: "G-X9LKH8CM8R"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);

// Safari / iOS සඳහා Local Persistence සකස් කිරීම
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence).catch(() => {
    setPersistence(auth, browserLocalPersistence);
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export { app, auth, googleProvider };