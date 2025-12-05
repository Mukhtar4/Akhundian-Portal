import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEyOm0hgrVT-eEZoGKBM77gcgAIY8aSAk",
  authDomain: "akhundian-portal.firebaseapp.com",
  projectId: "akhundian-portal",
  storageBucket: "akhundian-portal.firebasestorage.app",
  messagingSenderId: "71384890578",
  appId: "1:71384890578:web:1c91db2bec1e14fe0d010b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const isFirebaseEnabled = true;