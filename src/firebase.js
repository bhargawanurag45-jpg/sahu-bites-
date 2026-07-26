// Firebase setup for Sahu Bites
// This connects to the free Firestore database you already created
// (Firebase project: "sahubites"). Real-time orders/menu sync across
// every device happen through this file.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbvKJWvnLmlimfb7NkGUfWS-XtxrIxuCo",
  authDomain: "sahubites.firebaseapp.com",
  projectId: "sahubites",
  storageBucket: "sahubites.firebasestorage.app",
  messagingSenderId: "361415976341",
  appId: "1:361415976341:web:69b6b50cbb380c499d829c",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
