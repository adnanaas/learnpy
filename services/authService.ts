import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { User } from "../types";

export const authService = {
  // إنشاء حساب جديد في Firebase
  register: async (name: string, email: string, password: string): Promise<User | string> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData: User = {
        name,
        email,
        scores: {}
      };

      // حفظ بيانات المستخدم الإضافية في Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      return userData;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') return "هذا البريد مسجل مسبقاً!";
      return "حدث خطأ أثناء التسجيل، حاول مرة أخرى.";
    }
  },

  // تسجيل الدخول عبر Firebase
  login: async (email: string, password: string): Promise<User | string> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // جلب البيانات من Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as User;
      } else {
        return "لم يتم العثور على بيانات المستخدم.";
      }
    } catch (error: any) {
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    }
  },

  // تسجيل الخروج
  logout: async () => {
    await signOut(auth);
  },

  // حفظ الدرجة في Firestore
  saveScore: async (uid: string, lessonId: string, score: number) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        const currentScore = userData.scores[lessonId] || 0;
        
        if (score > currentScore) {
          const newScores = { ...userData.scores, [lessonId]: score };
          await updateDoc(docRef, { scores: newScores });
          return { ...userData, scores: newScores };
        }
      }
      return null;
    } catch (error) {
      console.error("Error saving score:", error);
      return null;
    }
  },

  // مراقب حالة المستخدم
  subscribeToAuthChanges: (callback: (user: User | null, uid: string | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          callback(docSnap.data() as User, user.uid);
        } else {
          callback(null, null);
        }
      } else {
        callback(null, null);
      }
    });
  }
};