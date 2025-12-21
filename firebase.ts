
// Fix: Use compat imports to resolve "no exported member" errors in both v8 and v9 environments
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9k9nb61VOQK7B348I7BZ3zltcR8UNfjg",
  authDomain: "pythonacademy-f4ef6.firebaseapp.com",
  projectId: "pythonacademy-f4ef6",
  storageBucket: "pythonacademy-f4ef6.firebasestorage.app",
  messagingSenderId: "605737988200",
  appId: "1:605737988200:web:1300dcf4d07e03e0a04bdd",
  measurementId: "G-GPPS82VBXN"
};

/**
 * Initialize Firebase correctly checking for existing apps using compatibility syntax.
 * This resolves issues where 'initializeApp', 'getApps', and 'getApp' were not found.
 */
const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Initialize services using compatibility methods to resolve 'getAuth' and 'getFirestore' errors
export const auth = firebase.auth();
export const db = firebase.firestore();

export default app;
