
import { User } from '../types';

const STORAGE_KEY = 'python_academy_users';

export const authService = {
  // جلب كل المستخدمين
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // تسجيل مستخدم جديد
  register: (name: string, email: string, password: string): User | string => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) return "الإيميل مسجل مسبقاً!";
    
    const newUser: User = { name, email, password, scores: {} };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  // تسجيل الدخول
  login: (email: string, password: string): User | string => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return "الإيميل أو كلمة المرور غير صحيحة";
    return user;
  },

  // حفظ درجة الدرس
  saveScore: (email: string, lessonId: string, score: number) => {
    const users = authService.getUsers();
    const userIdx = users.findIndex(u => u.email === email);
    if (userIdx !== -1) {
      // حفظ الدرجة الأعلى فقط
      const currentScore = users[userIdx].scores[lessonId] || 0;
      if (score > currentScore) {
        users[userIdx].scores[lessonId] = score;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[userIdx];
      }
    }
    return null;
  }
};
