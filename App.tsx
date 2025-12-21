
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import QuizModal from './components/QuizModal';
import AuthModal from './components/AuthModal';
import { LESSONS } from './constants';
import { LessonId, Lesson, User } from './types';
import { executeAndAnalyze } from './services/geminiService';
import { authService } from './services/authService';
import { isSupabaseConfigured } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [code, setCode] = useState(LESSONS[0].examples[0]);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((u, uid) => {
      setUser(u);
      setUserId(uid);
      setLoading(false);
    });

    const fallback = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  // تحديث الكود عند تغيير الدرس أو المثال
  const handleLessonChange = useCallback((id: LessonId) => {
    const found = LESSONS.find(l => l.id === id);
    if (found) {
      setLesson(found);
      setExampleIndex(0);
      setCode(found.examples[0]);
      setResult(null);
      setIsSidebarOpen(false);
    }
  }, []);

  const handleNextExample = () => {
    const nextIdx = (exampleIndex + 1) % lesson.examples.length;
    setExampleIndex(nextIdx);
    setCode(lesson.examples[nextIdx]);
    setResult(null);
  };

  const handleRun = async () => {
    if (executing) return;
    setExecuting(true);
    setResult(null);
    try {
      const res = await executeAndAnalyze(code, lesson.title);
      setResult(res);
    } catch (err) {
      setResult({ 
        output: "خطأ في الاتصال بالذكاء الاصطناعي", 
        feedback: "تأكد من إعداد مفتاح API_KEY بشكل صحيح." 
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleQuizFinish = async (scorePercentage: number) => {
    if (userId && isSupabaseConfigured()) {
      const updatedUser = await authService.saveScore(userId, lesson.id, scorePercentage);
      if (updatedUser) setUser(updatedUser);
    } else if (user) {
      setUser({
        ...user,
        scores: { ...user.scores, [lesson.id]: scorePercentage }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-6 animate-bounce">🐍</div>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-400 font-bold">جاري تحميل الأكاديمية...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right flex flex-col md:flex-row" dir="rtl">
      <Sidebar 
        activeLessonId={lesson.id} 
        onLessonSelect={handleLessonChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userScores={user.scores || {}}
      />
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {isQuizOpen && lesson.quiz && (
        <QuizModal 
          quiz={lesson.quiz} 
          lessonTitle={lesson.title} 
          onClose={() => setIsQuizOpen(false)}
          onFinish={handleQuizFinish}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 bg-white border-b px-4 md:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="flex flex-col">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate max-w-[150px] md:max-w-none">
                  {lesson.title}
                </h2>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full self-start">الطالب: {user.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lesson.examples.length > 1 && (
              <button onClick={handleNextExample} className="bg-amber-100 text-amber-700 px-3 py-2.5 rounded-xl text-[10px] font-black hover:bg-amber-200 border border-amber-200">
                مثال ✨
              </button>
            )}
            {lesson.quiz && (
              <button onClick={() => setIsQuizOpen(true)} className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 shadow-md shadow-indigo-100">
                تقويم 📝
              </button>
            )}
            <button onClick={handleRun} disabled={executing} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-200">
              {executing ? '...' : 'تشغيل ▶'}
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="w-full md:w-[350px] flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-1">
            <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm mb-4">
                <span className="bg-emerald-100 p-1.5 rounded-lg">📖</span> الشرح التعليمي
              </h3>
              <div className="text-xs md:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {lesson.content}
              </div>
            </section>
            
            <div className="h-[400px] shrink-0">
              <AITutor lessonTitle={lesson.title} lessonContent={lesson.content} currentCode={code} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 bg-[#0d1117] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              <div className="bg-[#161b22] px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Editor</span>
              </div>
              <textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                dir="ltr"
                spellCheck={false}
                className="flex-1 bg-transparent text-emerald-400 p-6 font-mono text-sm md:text-base focus:outline-none resize-none text-left"
              />
            </div>
            
            <div className="h-40 bg-[#010409] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl shrink-0">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-[9px] text-slate-500 font-mono font-bold">النتيجة</div>
              <div className="flex-1 p-4 font-mono text-xs text-left overflow-y-auto text-slate-100" dir="ltr">
                <span className="text-slate-600 mr-2">$</span>
                {result?.output || "بانتظار التشغيل..."}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
