import React, { useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../supabase';
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

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError('قاعدة البيانات غير متصلة. يرجى استخدام "وضع الزائر" في الأسفل.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authService.login(email, password);
        if (typeof res === 'string') setError(res);
        else onSuccess(res);
      } else {
        if (!name) {
          setError('يرجى كتابة الاسم بالكامل');
          setLoading(false);
          return;
        }
        const res = await authService.register(name, email, password);
        if (typeof res === 'string') setError(res);
        else onSuccess(res);
      }
    } catch (err) {
      setError("حدث خطأ مفاجئ. يرجى التأكد من الإعدادات.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    onSuccess({
      name: "زائر (وضع التجربة)",
      email: "guest@example.com",
      scores: {}
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 my-8">
        <div className="bg-emerald-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500 rounded-full opacity-20"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white rounded-full opacity-10"></div>
          <div className="relative z-10">
             <div className="text-6xl mb-4 drop-shadow-lg">🐍</div>
             <h2 className="text-3xl font-black mb-1">أكاديمية بايثون</h2>
             <p className="text-emerald-100 text-[10px] font-bold tracking-widest uppercase">AI-Powered Coding Academy</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!isConfigured && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl text-[10px] font-bold border border-amber-200 flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p>قاعدة البيانات (Supabase) غير متصلة.</p>
                <p className="mt-1 opacity-70">يمكنك المتابعة كزائر للاطلاع على الدروس فوراً.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-bold border border-rose-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider">الاسم بالكامل</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all text-sm font-bold"
                  placeholder="أدخل اسمك..."
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all text-sm font-bold"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all text-sm font-bold pl-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 focus:outline-none"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري المعالجة...</span>
                </div>
              ) : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب طالب')}
            </button>
          </form>

          <div className="flex flex-col gap-4 pt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 text-[11px] font-bold hover:text-emerald-600 transition-colors"
            >
              {isLogin ? 'ليس لديك حساب؟ سجل الآن مجاناً' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white px-2 text-slate-300">أو المتابعة بدون حساب</span></div>
            </div>
            
            <button 
              type="button"
              onClick={handleGuestMode}
              className="w-full py-4 bg-slate-800 text-white rounded-2xl text-xs font-black hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 flex items-center justify-center gap-2"
            >
              🚀 الدخول كزائر (تخطي التسجيل)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
