import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyChTBlxsMdX1r32DUhuLbX3_ovW5KVxAk4",
  authDomain: "ctsgmd.firebaseapp.com",
  projectId: "ctsgmd",
  storageBucket: "ctsgmd.firebasestorage.app",
  messagingSenderId: "444311511608",
  appId: "1:444311511608:web:4c82636ac5ed459c63fccd",
  measurementId: "G-4K6XMX44VK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore instance
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
