import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDmIQSovV4w4d11UfSiuY3sQhx8Y0B2130",
  authDomain: "eventnow-6acb5.firebaseapp.com",
  projectId: "eventnow-6acb5",
  storageBucket: "eventnow-6acb5.firebasestorage.app",
  messagingSenderId: "226415954916",
  appId: "1:226415954916:web:d4546e66704f206b0815f1",
  measurementId: "G-6GBG07NMME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
