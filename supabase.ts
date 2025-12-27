
import { createClient } from '@supabase/supabase-js';

// القيم التي حصلت عليها من لوحة تحكم Supabase
const supabaseUrl = 'https://cnzfgmrphkxnyowilyxx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuemZnbXJwaGt4bnlvd2lseXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTQwNTUsImV4cCI6MjA4MTg5MDA1NX0.wtTrBShXWyAwDZIZf-kj4IfXGsxWkr20MZFy75ROmwc';

// التحقق مما إذا كانت القيم لا تزال افتراضية (لأغراض التطوير)
export const isPlaceholderMode = supabaseUrl.includes('placeholder');

if (isPlaceholderMode) {
  console.log("%c⚠️ تنبيه الأكاديمية: لم يتم ربط قاعدة بيانات Supabase بعد.", "color: #f59e0b; font-weight: bold;");
} else {
  console.log("%c✅ تم الاتصال بنجاح بـ Supabase! نظام الطلاب جاهز.", "color: #10b981; font-weight: bold;");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
