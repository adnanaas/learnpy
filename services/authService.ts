
import { supabase } from '../supabase';
import { LessonId } from '../types';

// مفتاح التخزين المحلي لضمان السرعة (Cache)
const getStorageKey = (userId: string) => `python_academy_progress_${userId}`;

export const saveProgress = async (userId: string, lessonId: LessonId, score: number) => {
  // 1. تحديث التخزين المحلي فوراً لتجربة مستخدم سريعة جداً
  try {
    const localData = localStorage.getItem(getStorageKey(userId));
    const progress = localData ? JSON.parse(localData) : {};
    progress[lessonId] = score;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch (e) {
    console.warn('Local save warning:', e);
  }

  // 2. المزامنة مع السحابة (Supabase)
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        lesson_id: lessonId, 
        score: score,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Cloud Sync Error:', err.message);
    return { success: false, error: err.message };
  }
};

export const fetchProgress = async (userId: string) => {
  let combinedScores: Record<string, number> = {};

  // 1. تحميل البيانات من الذاكرة المحلية أولاً (Offline-First)
  try {
    const localData = localStorage.getItem(getStorageKey(userId));
    if (localData) {
      combinedScores = JSON.parse(localData);
    }
  } catch (e) {
    console.error('Local fetch error');
  }

  // 2. جلب أحدث البيانات من السحابة لضمان الدقة
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, score')
      .eq('user_id', userId);
    
    if (!error && data) {
      // دمج بيانات السحابة مع المحلية (السحابة لها الأولوية)
      data.forEach(item => {
        combinedScores[item.lesson_id] = item.score;
      });
      // تحديث الكاش المحلي بالبيانات الجديدة
      localStorage.setItem(getStorageKey(userId), JSON.stringify(combinedScores));
    }
  } catch (err: any) {
    console.warn('Could not sync with cloud, using local data only.');
  }

  return combinedScores;
};
