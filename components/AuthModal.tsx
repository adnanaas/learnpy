
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = authService.login(email, password);
      if (typeof res === 'string') setError(res);
      else onSuccess(res);
    } else {
      if (!name) return setError('يرجى كتابة الاسم');
      const res = authService.register(name, email, password);
      if (typeof res === 'string') setError(res);
      else onSuccess(res);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500 rounded-full opacity-20"></div>
          <div className="relative z-10">
             <div className="text-5xl mb-4">🐍</div>
             <h2 className="text-3xl font-black mb-2">مرحباً بك!</h2>
             <p className="text-emerald-100 text-sm">أكاديمية بايثون الذكية بانتظارك</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 px-1">الاسم بالكامل</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold"
                placeholder="أحمد محمد..."
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 px-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 px-1">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold pl-12"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </button>

          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setShowPassword(false); }}
            className="w-full text-slate-400 text-xs font-bold hover:text-emerald-600 transition-colors"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
