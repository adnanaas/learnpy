// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9k9nb61VOQK7B348I7BZ3zltcR8UNfjg",
  authDomain: "pythonacademy-f4ef6.firebaseapp.com",
  projectId: "pythonacademy-f4ef6",
  storageBucket: "pythonacademy-f4ef6.firebasestorage.app",
  messagingSenderId: "605737988200",
  appId: "1:605737988200:web:1300dcf4d07e03e0a04bdd",
  measurementId: "G-GPPS82VBXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);