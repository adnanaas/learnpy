
import React, { useState, useEffect } from 'react';
import { LESSONS } from './constants';
import { LessonId, Lesson } from './types';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import { getCodeExecutionFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);
  const [code, setCode] = useState(activeLesson.defaultCode);
  const [feedback, setFeedback] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    setCode(activeLesson.defaultCode);
    setFeedback(null);
  }, [activeLesson]);

  const runCode = async () => {
    setIsExecuting(true);
    setFeedback(null);
    try {
      const result = await getCodeExecutionFeedback(code, activeLesson.title);
      setFeedback(result);
    } catch {
      setFeedback({ isCorrect: false, output: "Error.", feedback: "تعذر الاتصال بالمعلم.", suggestions: [], fixedCode: code });
    } finally {
      setIsExecuting(false);
    }
  };

  const applyFix = () => {
    if (feedback?.fixedCode) {
      setCode(feedback.fixedCode);
      setFeedback(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden" dir="rtl">
      {/* القائمة الجانبية - عادت كما كانت في الأصل */}
      <Sidebar activeLessonId={activeLesson.id} onLessonSelect={id => setActiveLesson(LESSONS.find(l => l.id === id) || LESSONS[0])} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* هيدر الصفحة */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
          <div className="flex flex-col">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeLesson.title}</h2>
             <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">المستوى الأساسي</span>
          </div>
          <div className="flex gap-2">
            {feedback && !feedback.isCorrect && (
              <button onClick={applyFix} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold border border-amber-200 hover:bg-amber-200 transition-all flex items-center gap-2 shadow-sm">
                <span>🪄</span> إصلاح الكود
              </button>
            )}
            <button 
              onClick={runCode} 
              disabled={isExecuting} 
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isExecuting ? 'جاري التشغيل...' : (
                <>
                  <span className="text-base">▶</span> تشغيل الكود
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-5 gap-5">
          {/* العمود الأيمن: الشرح والمعلم */}
          <div className="w-[38%] flex flex-col gap-5 overflow-hidden h-full">
            
            {/* شرح الدرس (ممتاز وطويل كما طلبت) */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col flex-[1.4] overflow-hidden min-h-0">
               <div className="p-5 border-b border-slate-50 shrink-0 flex items-center justify-between bg-white">
                  <h3 className="text-slate-800 font-black text-lg flex items-center gap-2">
                    <span className="text-emerald-500">📖</span>
                    شرح الدرس
                  </h3>
               </div>
               <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                  <p className="text-slate-600 text-[16px] leading-[1.8] whitespace-pre-wrap font-medium">
                    {activeLesson.content}
                  </p>
               </div>
            </section>
            
            {/* المعلم الذكي (تم ضبط المساحة لظهور خانة الإدخال) */}
            <div className="flex-1 min-h-0">
               <AITutor lessonTitle={activeLesson.title} lessonContent={activeLesson.content} currentCode={code} />
            </div>
          </div>

          {/* العمود الأيسر: المحرر والكونسول */}
          <div className="flex-1 flex flex-col gap-5 overflow-hidden">
            <div className="flex-1 bg-[#0d1117] rounded-3xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden min-h-[200px]">
              <div className="bg-[#161b22] px-6 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                <span className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-widest">Editor / main.py</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
              </div>
              <textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                dir="ltr" 
                className="flex-1 bg-transparent text-[#e6edf3] p-6 font-mono text-lg focus:outline-none resize-none leading-relaxed text-left selection:bg-emerald-500/30"
                spellCheck={false}
              />
            </div>

            <div className="flex-1 bg-[#010409] rounded-3xl border border-slate-800 flex flex-col shadow-inner overflow-hidden min-h-[200px]">
              <div className="bg-slate-950 px-6 py-2.5 text-[9px] text-slate-500 font-black tracking-widest border-b border-slate-800 flex justify-between items-center shrink-0">
                <span>PYTHON CONSOLE</span>
              </div>
              <div className="flex-1 p-6 font-mono text-lg text-left overflow-y-auto whitespace-pre-wrap leading-relaxed text-emerald-400 custom-scrollbar" dir="ltr">
                {isExecuting ? (
                  <div className="flex items-center gap-3 text-slate-600 italic">
                    <span className="animate-spin text-xl">⏳</span>
                    <span>Running...</span>
                  </div>
                ) : (
                  <div className="opacity-90">
                    {feedback?.output || <span className="text-slate-700 italic opacity-40 font-sans text-sm"># المخرجات ستظهر هنا بعد التشغيل...</span>}
                  </div>
                )}
              </div>
            </div>

            {feedback && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 shrink-0 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${feedback.isCorrect ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                   <span className="text-xl">{feedback.isCorrect ? '✅' : '❌'}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>{feedback.feedback}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
