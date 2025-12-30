// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- import Auth
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCMYFfCA-8miNkqDnz7ngqLO5KKUXHUM0",
  authDomain: "cosmobot-9cde8.firebaseapp.com",
  projectId: "cosmobot-9cde8",
  storageBucket: "cosmobot-9cde8.appspot.com",
  messagingSenderId: "477432229408",
  appId: "1:477432229408:web:df8007d5f256015f8b9645",
  measurementId: "G-JZC6RXVV0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export default app;
