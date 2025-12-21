
import { createClient } from '@supabase/supabase-js';

/**
 * دالة جلب الإعدادات بشكل آمن يمنع الانهيار
 */
const getSupabaseConfig = () => {
  let url = '';
  let key = '';

  try {
    // محاولة جلب القيم من البيئة
    url = process.env.SUPABASE_URL || '';
    key = process.env.SUPABASE_ANON_KEY || '';
  } catch (e) {
    // في حال عدم وجود كائن process (بيئة المتصفح الخام)
    console.warn("Environment variables not injected yet.");
  }

  // استخدام روابط وهمية صالحة التنسيق فقط إذا كانت القيم فارغة
  const finalUrl = (url && url.startsWith('http')) ? url : 'https://placeholder-project.supabase.co';
  const finalKey = key || 'placeholder-key';
  
  // التحقق مما إذا كان المشروع قد تم ربطه فعلياً بمشروع حقيقي
  const isReal = url && url.startsWith('http') && !url.includes('your-project');

  return { finalUrl, finalKey, isReal };
};

const config = getSupabaseConfig();

// إنشاء العميل
export const supabase = createClient(config.finalUrl, config.finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// دالة التحقق للاستخدام في المكونات
export const isSupabaseConfigured = () => {
  const check = getSupabaseConfig();
  return check.isReal;
};
