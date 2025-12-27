
// Add missing React import to fix 'Cannot find namespace React' errors on lines 10 and 25.
import React, { useState } from 'react';
import { supabase, isPlaceholderMode } from '../supabase';

interface AuthModalProps {
  onSuccess: () => void;
  onGuestAccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onGuestAccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateError = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'بيانات الدخول غير صحيحة. هل قمت بإنشاء حساب أولاً؟';
    if (msg.includes('Email not confirmed')) return 'يرجى تأكيد بريدك الإلكتروني من خلال الرابط المرسل إليك.';
    if (msg.includes('User already registered')) return 'هذا البريد مسجل مسبقاً، حاول تسجيل الدخول.';
    if (msg.includes('Password should be at least 6 characters')) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    return msg;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isPlaceholderMode) {
      setError('إعدادات قاعدة البيانات غير مكتملة في Vercel. يرجى الدخول كضيف حالياً.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onSuccess();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // اظهر رسالة النجاح ثم حوله لشاشة الدخول
        alert('تم تسجيل البيانات بنجاح! 🎉 يرجى تفعيل حسابك من البريد الإلكتروني ثم سجل دخولك.');
        setIsLogin(true);
        setError(null);
      }
    } catch (err: any) {
      setError(translateError(err.message || 'حدث خطأ غير متوقع'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-white/20">
        <div className="bg-slate-800 p-8 text-white text-center">
          <div className="text-5xl mb-4">🐍</div>
          <h2 className="text-2xl font-black mb-2">
            {isLogin ? 'مرحباً بك مجدداً' : 'انضم للأكاديمية'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'سجل دخولك لمتابعة دروسك' : 'أنشئ حساباً جديداً لتبدأ رحلتك'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-[11px] font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <input 
                type="text" 
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold"
                placeholder="الاسم الكامل"
              />
            )}
            
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold"
              placeholder="البريد الإلكتروني"
            />

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold"
                placeholder="كلمة المرور"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'جاري العمل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد')}
          </button>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-slate-500 text-[11px] font-bold hover:text-emerald-600 transition-colors"
            >
              {isLogin ? 'ليس لديك حساب؟ اضغط هنا للتسجيل' : 'لديك حساب بالفعل؟ سجل دخولك من هنا'}
            </button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold uppercase">أو</span>
                <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              type="button"
              onClick={onGuestAccess}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-black text-[11px] transition-all"
            >
              تخطي والدخول كضيف ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
