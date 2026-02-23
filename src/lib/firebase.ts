import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDPz6G4-qg_5D9U_EybpWi3gNacaIkvnw0",
  authDomain: "cosmobot-9cde8.firebaseapp.com",
  projectId: "cosmobot-9cde8",
  storageBucket: "cosmobot-9cde8.firebasestorage.app",
  messagingSenderId: "477432229408",
  appId: "1:477432229408:web:4fcc318c2eb962838b9645",
  measurementId: "G-SJ9HFWZEMH"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export default app;

