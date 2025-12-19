
import React from 'react';
import { LESSONS } from '../constants';
import { LessonId } from '../types';

interface SidebarProps {
  activeLessonId: LessonId;
  onLessonSelect: (id: LessonId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeLessonId, onLessonSelect }) => {
  return (
    <div className="w-80 bg-white border-l border-slate-100 h-screen flex flex-col shadow-sm shrink-0">
      <div className="p-8 pb-4">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🐍</span> أكاديمية بايثون
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        {LESSONS.map((lesson, index) => (
          <button
            key={lesson.id}
            onClick={() => onLessonSelect(lesson.id)}
            className={`w-full text-right px-4 py-3.5 rounded-2xl transition-all flex items-center gap-4 group ${
              activeLessonId === lesson.id 
                ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-500 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              activeLessonId === lesson.id 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
            }`}>
              {index + 1}
            </span>
            <span className="truncate text-[15px]">{lesson.title}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-50 text-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Python AI 2025</span>
      </div>
    </div>
  );
};

export default Sidebar;
