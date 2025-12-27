
import React from 'react';
import { LESSONS } from '../constants';
import { LessonId } from '../types';
import { supabase } from '../supabase';

interface SidebarProps {
  activeLessonId: LessonId;
  onLessonSelect: (id: LessonId) => void;
  isOpen: boolean;
  onClose: () => void;
  userScores: Record<string, number>;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLessonId, onLessonSelect, isOpen, onClose, userScores, user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'طالب';
  const completedCount = Object.keys(userScores).length;

  // تحديد مستوى الطالب بناءً على التقدم
  const getLevelLabel = () => {
    if (completedCount === 0) return '🌱 مبتدئ';
    if (completedCount <= 3) return '🔍 مستكشف';
    if (completedCount <= 7) return '💻 مبرمج طموح';
    if (completedCount < LESSONS.length) return '⚡ متقدم';
    return '🎓 مبرمج محترف';
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none shrink-0
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6 pb-4 flex items-center justify-between border-b md:border-none">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🐍</span> بايثون الذكية
        </h1>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      {user && (
        <div className="px-6 py-2">
          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex items-center gap-3 shadow-sm relative group transition-all hover:bg-emerald-100/50">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-emerald-200 shrink-0">
              {studentName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-[11px] font-black text-slate-800 truncate mb-0.5">{studentName}</p>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-200/50 px-2 py-0.5 rounded-lg border border-emerald-200/50">
                {getLevelLabel()}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"
              title="تسجيل الخروج"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
            style={{ width: `${(completedCount / LESSONS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">الدروس المكتملة</p>
            <p className="text-[10px] text-emerald-600 font-bold">{completedCount} من {LESSONS.length}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {LESSONS.map((lesson, index) => {
          const score = userScores[lesson.id];
          const isCompleted = score !== undefined;
          
          return (
            <div key={lesson.id} className="group">
              <button
                onClick={() => {
                    onLessonSelect(lesson.id);
                    if (window.innerWidth < 768) onClose();
                }}
                className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center gap-3 relative ${
                  activeLessonId === lesson.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                  activeLessonId === lesson.id ? 'bg-white text-emerald-600' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isCompleted && activeLessonId !== lesson.id ? '✓' : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${activeLessonId === lesson.id ? 'text-white' : 'text-slate-700'}`}>
                        {lesson.title}
                    </p>
                    {isCompleted && (
                        <p className={`text-[9px] font-bold ${activeLessonId === lesson.id ? 'text-emerald-100' : 'text-emerald-500'}`}>
                            درجتك: {score}%
                        </p>
                    )}
                </div>
              </button>
            </div>
          );
        })}
      </nav>
      
      <div className="p-4 border-t bg-slate-50/50">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter">إحصائيات الأداء</p>
            <div className="text-[11px] font-black text-slate-800">
                {completedCount >= LESSONS.length ? 'مبروك! أتممت الدورة بنجاح 🏅' : `بقي لك ${LESSONS.length - completedCount} دروس`}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
