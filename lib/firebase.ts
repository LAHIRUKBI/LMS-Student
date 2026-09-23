// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtkxZ_nEZoawnRtVyMk9joOZiny1DMxgs",
  authDomain: "lms-sys-38d8f.firebaseapp.com",
  projectId: "lms-sys-38d8f",
  storageBucket: "lms-sys-38d8f.firebasestorage.app",
  messagingSenderId: "1050165058586",
  appId: "1:1050165058586:web:18553f772465b6422045a3",
  measurementId: "G-X9LKH8CM8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);