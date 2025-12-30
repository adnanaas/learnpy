
import { supabase } from '../supabase';
import { LessonId } from '../types';

// مفتاح التخزين المحلي
const getStorageKey = (userId: string) => `python_academy_progress_${userId}`;

export const saveProgress = async (userId: string, lessonId: LessonId, score: number) => {
  // 1. الحفظ في التخزين المحلي أولاً لضمان السرعة
  try {
    const localData = localStorage.getItem(getStorageKey(userId));
    const progress = localData ? JSON.parse(localData) : {};
    progress[lessonId] = score;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch (e) {
    console.warn('تعذر الحفظ محلياً:', e);
  }

  // 2. الحفظ في Supabase للاتصال الدائم
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        lesson_id: lessonId, 
        score: score,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error('خطأ في مزامنة السحابة:', err.message);
    return { data: null, error: err.message };
  }
};

export const fetchProgress = async (userId: string) => {
  let combinedScores: Record<string, number> = {};

  // 1. جلب البيانات من التخزين المحلي (فوري)
  try {
    const localData = localStorage.getItem(getStorageKey(userId));
    if (localData) {
      combinedScores = JSON.parse(localData);
    }
  } catch (e) {
    console.error('خطأ في قراءة التخزين المحلي');
  }

  // 2. جلب البيانات من السحابة (دقيق)
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, score')
      .eq('user_id', userId);
    
    if (!error && data) {
      data.forEach(item => {
        combinedScores[item.lesson_id] = item.score;
      });
      // تحديث الكاش المحلي ببيانات السحابة الأحدث
      localStorage.setItem(getStorageKey(userId), JSON.stringify(combinedScores));
    }
  } catch (err: any) {
    console.error('فشل جلب البيانات من السحابة، سيتم الاعتماد على الكاش:', err.message);
  }

  return combinedScores;
};
