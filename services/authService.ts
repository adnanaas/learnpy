import { supabase, isSupabaseConfigured } from "../supabase";
import { User } from "../types";

const CONFIG_ERROR = "تنبيه: قاعدة البيانات غير متصلة حالياً. يرجى ضبط الإعدادات أو استخدام وضع الزائر.";

export const authService = {
  register: async (name: string, email: string, password: string): Promise<User | string> => {
    if (!supabase || !isSupabaseConfigured()) return CONFIG_ERROR;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) return error.message;

      if (data.user) {
        // ننتظر قليلاً لضمان استقرار الجلسة
        await new Promise(resolve => setTimeout(resolve, 800));

        const userData: User = {
          name,
          email,
          scores: {}
        };
        
        // محاولة إنشاء الملف الشخصي مع معالجة خطأ RLS
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, name, email, scores: {} }]);

        if (profileError) {
            console.error("RLS Error:", profileError);
            if (profileError.message.includes("row-level security")) {
                return "حدث خطأ في صلاحيات قاعدة البيانات (RLS). يرجى التأكد من إعداد سياسات الوصول في Supabase أو استخدام وضع الزائر.";
            }
            return profileError.message;
        }
        return userData;
      }
      return "تعذر إنشاء المستخدم.";
    } catch (err: any) {
      return "خطأ في الاتصال بالخادم.";
    }
  },

  login: async (email: string, password: string): Promise<User | string> => {
    if (!supabase || !isSupabaseConfigured()) return CONFIG_ERROR;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return "بيانات الدخول غير صحيحة.";
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profileError || !profile) return "تم الدخول ولكن تعذر جلب بيانات الملف الشخصي.";
        return profile as User;
      }
      return "خطأ غير متوقع.";
    } catch (err: any) {
      return "فشل الاتصال.";
    }
  },

  logout: async () => {
    if (supabase && isSupabaseConfigured()) await supabase.auth.signOut();
  },

  saveScore: async (uid: string, lessonId: string, score: number) => {
    if (!supabase || !isSupabaseConfigured()) return null;
    try {
      const { data: profile } = await supabase.from('profiles').select('scores').eq('id', uid).single();
      if (!profile) return null;
      const currentScores = profile.scores || {};
      if (score > (currentScores[lessonId] || 0)) {
        const newScores = { ...currentScores, [lessonId]: score };
        const { data: updated } = await supabase.from('profiles').update({ scores: newScores }).eq('id', uid).select().single();
        return updated as User;
      }
      return null;
    } catch (err) { return null; }
  },

  subscribeToAuthChanges: (callback: (user: User | null, uid: string | null) => void) => {
    if (!supabase || !isSupabaseConfigured()) { 
      callback(null, null); 
      return () => {}; 
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(
            ({ data: profile }) => callback(profile as User, session.user.id),
            () => callback(null, session.user.id)
          );
      } else { 
        callback(null, null); 
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        callback(profile as User, session.user.id);
      } else { 
        callback(null, null); 
      }
    });
    
    return () => subscription.unsubscribe();
  }
};
