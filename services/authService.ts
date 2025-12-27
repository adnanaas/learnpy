
import { supabase } from '../supabase';
import { LessonId } from '../types';

export const saveProgress = async (userId: string, lessonId: LessonId, score: number) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        lesson_id: lessonId, 
        score: score,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
    
    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error('فشل في حفظ التقدم:', errorMsg);
      return { data: null, error: errorMsg };
    }
    return { data, error: null };
  } catch (err: any) {
    const catchMsg = err.message || 'حدث خطأ غير متوقع أثناء الحفظ';
    console.error('خطأ غير متوقع أثناء الحفظ:', catchMsg);
    return { data: null, error: catchMsg };
  }
};

export const fetchProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, score')
      .eq('user_id', userId);
    
    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error('خطأ في جلب التقدم:', errorMsg);
      return {};
    }

    const scores: Record<string, number> = {};
    if (data) {
      data.forEach(item => {
        scores[item.lesson_id] = item.score;
      });
    }
    return scores;
  } catch (err: any) {
    console.error('خطأ فني في fetchProgress:', err.message || 'Error');
    return {};
  }
};
