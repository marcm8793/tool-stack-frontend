// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "tool-stack.firebaseapp.com",
  projectId: "tool-stack",
  storageBucket: "tool-stack.appspot.com",
  messagingSenderId: "649189945816",
  appId: "1:649189945816:web:c6f9bfbdf3eac190e742ad",
  measurementId: "G-667YKP12QV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const analyticsApp = analytics;
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
