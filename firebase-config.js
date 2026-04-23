// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZtqO-2AweYdAHyw8bsmX6TVBxI49QxNE",
  authDomain: "priyanshu-b.firebaseapp.com",
  projectId: "priyanshu-b",
  storageBucket: "priyanshu-b.firebasestorage.app",
  messagingSenderId: "640800536105",
  appId: "1:640800536105:web:820858a331330dbfc9ce38",
  measurementId: "G-75JV4QWJM6"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, doc, getDoc, setDoc, onSnapshot, signInWithEmailAndPassword, onAuthStateChanged, signOut };
