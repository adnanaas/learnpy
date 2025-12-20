
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import { LESSONS } from './constants';
import { LessonId, Lesson } from './types';
import { executeAndAnalyze } from './services/geminiService';

const App: React.FC = () => {
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [code, setCode] = useState(lesson.defaultCode);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setCode(lesson.defaultCode);
    setResult(null);
  }, [lesson]);

  const handleRun = async () => {
    setExecuting(true);
    try {
      const res = await executeAndAnalyze(code, lesson.title);
      setResult(res);
    } catch {
      setResult({ output: "خطأ في الاتصال بالمصحح الذكي", feedback: "يرجى التحقق من اتصال الإنترنت أو مفتاح API." });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-right" dir="rtl">
      {/* القائمة الجانبية */}
      <Sidebar 
        activeLessonId={lesson.id} 
        onLessonSelect={id => setLesson(LESSONS.find(l => l.id === id)!)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* غطاء خلفي عند فتح القائمة في الجوال */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* الهيدر */}
        <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate max-w-[140px] md:max-w-none">
                {lesson.title}
                </h2>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full md:text-xs">جاري التعلم</span>
            </div>
          </div>
          
          <button 
            onClick={handleRun} 
            disabled={executing}
            className="bg-emerald-600 text-white px-5 md:px-8 py-2.5 rounded-2xl text-xs md:text-sm font-black hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            {executing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                جاري...
              </span>
            ) : (
              <>
                <span className="hidden md:inline">تشغيل الكود</span>
                <span className="md:hidden">تشغيل</span>
                <span className="text-lg">▶</span>
              </>
            )}
          </button>
        </header>

        {/* المحتوى الرئيسي المتجاوب */}
        <div className="flex-1 flex flex-col md:flex-row p-3 md:p-6 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden">
          
          {/* قسم الشرح والمعلم (يسار/أعلى) */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col gap-4 md:gap-6 shrink-0 h-auto md:h-full">
            <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                <span className="bg-emerald-100 p-1.5 rounded-lg">📖</span> الشرح المبسط
              </h3>
              <div className="text-xs md:text-sm leading-relaxed text-slate-600 font-medium">
                {lesson.content}
              </div>
            </section>
            
            <div className="h-[450px] md:flex-1 min-h-[400px]">
              <AITutor lessonTitle={lesson.title} lessonContent={lesson.content} currentCode={code} />
            </div>
          </div>

          {/* قسم المحرر والمخرجات (يمين/أسفل) */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-[550px] md:min-h-0 h-auto md:h-full">
            {/* المحرر */}
            <div className="flex-1 bg-[#0d1117] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
              <div className="bg-[#161b22] px-5 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">PYTHON_EDITOR</span>
              </div>
              <textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                dir="ltr"
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                className="flex-1 bg-transparent text-emerald-400 p-6 font-mono text-sm md:text-lg focus:outline-none resize-none text-left leading-relaxed custom-scrollbar"
              />
              <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 font-mono pointer-events-none">utf-8</div>
            </div>
            
            {/* الكونسول (المخرجات) */}
            <div className="h-56 md:h-1/3 bg-[#010409] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl shrink-0">
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 text-[10px] text-slate-500 font-mono font-bold flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    CONSOLE_OUTPUT
                </span>
                {result && <span className={`px-2 py-0.5 rounded text-[9px] ${result.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {result.isCorrect ? 'PASS' : 'ERROR'}
                </span>}
              </div>
              <div className="flex-1 p-5 font-mono text-xs md:text-sm text-left overflow-y-auto text-slate-100 custom-scrollbar" dir="ltr">
                <span className="text-slate-600 mr-2">$</span>
                {result?.output || "waiting for code execution..."}
              </div>
              {result && (
                <div className={`p-4 text-[11px] md:text-xs font-bold border-t border-slate-800/50 ${result.isCorrect ? 'bg-emerald-900/20 text-emerald-300' : 'bg-rose-900/20 text-rose-300'}`}>
                  <div className="flex items-start gap-2">
                    <span>{result.isCorrect ? '💡' : '⚠️'}</span>
                    <p className="leading-normal">{result.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
