
import { supabase } from '../supabase';
import { LessonId } from '../types';

const getStorageKey = (userId: string) => `python_academy_progress_${userId}`;

/**
 * جلب البيانات المحلية فوراً لضمان عدم تعليق واجهة المستخدم
 */
export const getLocalProgress = (userId: string): Record<string, number> => {
  try {
    const localData = localStorage.getItem(getStorageKey(userId));
    return localData ? JSON.parse(localData) : {};
  } catch {
    return {};
  }
};

/**
 * حفظ التقدم في الحقل الخاص metadata مع المزامنة الخلفية
 */
export const saveProgress = async (userId: string, lessonId: LessonId, score: number, extraData: any = {}) => {
  // 1. تحديث محلي فوري (تجربة مستخدم سريعة)
  const progress = getLocalProgress(userId);
  progress[lessonId] = score;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));

  // 2. تحديث السحابة (خلفي)
  try {
    const { error } = await supabase.from('user_progress').upsert({ 
      user_id: userId, 
      lesson_id: lessonId, 
      score: score,
      metadata: {
        ...extraData,
        last_updated: new Date().toISOString(),
        platform: 'web_academy'
      },
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });
    
    return { success: !error };
  } catch (err) {
    console.warn('Background sync deferred.');
    return { success: false };
  }
};

/**
 * مزامنة صامتة في الخلفية لتحديث البيانات المحلية
 */
export const syncCloudProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, score')
      .eq('user_id', userId);
    
    if (!error && data) {
      const cloudScores: Record<string, number> = {};
      data.forEach((item: any) => {
        cloudScores[item.lesson_id] = item.score;
      });
      localStorage.setItem(getStorageKey(userId), JSON.stringify(cloudScores));
      return cloudScores;
    }
  } catch (err) {
    console.error('Sync failure:', err);
  }
  return null;
};
