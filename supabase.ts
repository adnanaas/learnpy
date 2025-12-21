import { createClient } from '@supabase/supabase-js';

/**
 * 💡 حل مشكلة 'Invalid URL': 
 * قمنا بتحسين تهيئة العميل للتأكد من أن الرابط صالح قبل محاولة إنشاء الاتصال.
 */

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const key = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
  
  // التحقق من أن الرابط يبدأ بـ http لضمان صحته
  const isValidUrl = url.startsWith('http');
  
  return { url, key, isValidUrl };
};

const config = getSupabaseConfig();

export const supabase = config.isValidUrl 
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export const isSupabaseConfigured = () => {
  const { url, isValidUrl } = getSupabaseConfig();
  return (
    supabase !== null &&
    isValidUrl &&
    !url.includes('placeholder-project')
  );
};
