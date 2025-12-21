
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authService.login(email, password);
        if (typeof res === 'string') setError(res);
        else onSuccess(res);
      } else {
        if (!name) {
          setError('يرجى كتابة الاسم');
          setLoading(false);
          return;
        }
        const res = await authService.register(name, email, password);
        if (typeof res === 'string') setError(res);
        else onSuccess(res);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500 rounded-full opacity-20"></div>
          <div className="relative z-10">
             <div className="text-5xl mb-4">🐍</div>
             <h2 className="text-3xl font-black mb-2">أكاديمية بايثون</h2>
             <p className="text-emerald-100 text-sm">بياناتك محفوظة بأمان في السحابة</p>
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
                disabled={loading}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold disabled:opacity-50"
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
              disabled={loading}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm font-bold pl-12 disabled:opacity-50"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? 'دخول' : 'تسجيل')}
          </button>

          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setShowPassword(false); }}
            className="w-full text-slate-400 text-xs font-bold hover:text-emerald-600"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
