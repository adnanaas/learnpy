
import React from 'react';
import { LESSONS } from '../constants';
import { LessonId } from '../types';

interface SidebarProps {
  activeLessonId: LessonId;
  onLessonSelect: (id: LessonId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLessonId, onLessonSelect, isOpen, onClose }) => {
  return (
    <div className={`
      fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none shrink-0
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6 pb-4 flex items-center justify-between border-b md:border-none">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🐍</span> بايثون الذكية
        </h1>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg md:hidden text-slate-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="px-6 py-4">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
            style={{ width: `${((LESSONS.findIndex(l => l.id === activeLessonId) + 1) / LESSONS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">تقدمك</p>
            <p className="text-[10px] text-emerald-600 font-bold">{Math.round(((LESSONS.findIndex(l => l.id === activeLessonId) + 1) / LESSONS.length) * 100)}%</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {LESSONS.map((lesson, index) => (
          <button
            key={lesson.id}
            onClick={() => {
                onLessonSelect(lesson.id);
                if (window.innerWidth < 768) onClose();
            }}
            className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
              activeLessonId === lesson.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              activeLessonId === lesson.id ? 'bg-white text-emerald-600' : 'bg-slate-100 group-hover:bg-slate-200 text-slate-500'
            }`}>
              {index + 1}
            </span>
            <span className="font-bold text-sm truncate">{lesson.title}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">🎓</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">أكاديمية بايثون</p>
            <p className="text-[10px] text-slate-400">نظام التعلم الذكي 1.4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
