import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9k9nb61VOQK7B348I7BZ3zltcR8UNfjg",
  authDomain: "pythonacademy-f4ef6.firebaseapp.com",
  projectId: "pythonacademy-f4ef6",
  storageBucket: "pythonacademy-f4ef6.firebasestorage.app",
  messagingSenderId: "605737988200",
  appId: "1:605737988200:web:1300dcf4d07e03e0a04bdd",
  measurementId: "G-GPPS82VBXN"
};

// تهيئة التطبيق مع التحقق لتجنب التكرار الذي يسبب أخطاء التسجيل
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// تهيئة وتصدير الخدمات من نفس نسخة التطبيق
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;