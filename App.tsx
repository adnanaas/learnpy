
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import QuizModal from './components/QuizModal';
import AboutModal from './components/AboutModal';
import AuthModal from './components/AuthModal';
import { LESSONS } from './constants';
import { LessonId, Lesson } from './types';
import { executeAndAnalyze } from './services/geminiService';
import { supabase } from './supabase';
import { fetchProgress, saveProgress } from './services/authService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [code, setCode] = useState(LESSONS[0].examples[0]);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [userScores, setUserScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // التحقق من حالة المستخدم عند البدء
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProgress(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProgress(session.user.id);
      } else {
        setUserScores({});
        setIsGuest(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProgress = async (userId: string) => {
    try {
      const scores = await fetchProgress(userId);
      setUserScores(scores);
    } catch (e: any) {
      console.warn('تعذر تحميل التقدم:', e.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    setUser(null);
  };

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
        output: "تعذر الاتصال بالذكاء الاصطناعي", 
        feedback: "يرجى التحقق من مفتاح الـ API في إعدادات المنصة." 
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleQuizFinish = async (scorePercentage: number) => {
    const newScores = { ...userScores, [lesson.id]: scorePercentage };
    setUserScores(newScores);
    
    if (user) {
      try {
        await saveProgress(user.id, lesson.id, scorePercentage);
      } catch (e) {
        console.error('فشل الحفظ في السحابة');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-6 animate-bounce">🐍</div>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-400 font-bold">جاري المزامنة مع السحابة...</p>
      </div>
    );
  }

  const showAuth = !user && !isGuest;

  return (
    <div className="min-h-screen bg-slate-50 text-right flex flex-col md:flex-row" dir="rtl">
      {showAuth && (
        <AuthModal 
          onSuccess={() => setIsGuest(false)} 
          onGuestAccess={() => setIsGuest(true)} 
        />
      )}
      
      <Sidebar 
        activeLessonId={lesson.id} 
        onLessonSelect={handleLessonChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userScores={userScores}
        user={user || (isGuest ? { email: 'guest@academy.local' } : null)}
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

      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b px-4 md:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="flex flex-col">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate max-w-[150px] md:max-w-none">
                  {lesson.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {isGuest ? 'وضع الضيف ✨' : 'أكاديمية بايثون المستقلة'}
                  </span>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(user || isGuest) && (
              <button 
                onClick={handleLogout}
                className="p-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                title="تسجيل الخروج"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            )}

            <button 
              onClick={() => setIsAboutOpen(true)} 
              className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all hidden md:block"
              title="حول المنصة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>

            {lesson.examples.length > 1 && (
              <button 
                onClick={handleNextExample} 
                className="bg-amber-100 text-amber-700 px-3 py-2.5 rounded-xl text-[10px] font-black hover:bg-amber-200 border border-amber-200 transition-all flex items-center gap-1.5"
                title="عرض المثال التالي"
              >
                <span>مثال ✨</span>
                <span className="bg-amber-200/50 px-1.5 py-0.5 rounded-lg">{exampleIndex + 1}/{lesson.examples.length}</span>
              </button>
            )}
            {lesson.quiz && (
              <button onClick={() => setIsQuizOpen(true)} className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors">
                تقويم 📝
              </button>
            )}
            <button onClick={handleRun} disabled={executing} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-200 transition-all">
              {executing ? 'جاري التحليل...' : 'تشغيل ▶'}
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="w-full md:w-[350px] flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar">
            <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm mb-4">
                <span className="bg-emerald-100 p-1.5 rounded-lg">📖</span> الشرح التعليمي
              </h3>
              <div className="text-xs md:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap italic">
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
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">مثال {exampleIndex + 1}</span>
              </div>
              <textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                dir="ltr"
                spellCheck={false}
                className="flex-1 bg-transparent text-emerald-400 p-6 font-mono text-sm md:text-base focus:outline-none resize-none text-left leading-relaxed"
                placeholder="# اكتب كود بايثون هنا..."
              />
            </div>
            
            <div className="h-44 bg-[#010409] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-xl shrink-0">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-[9px] text-slate-500 font-mono font-bold flex justify-between items-center">
                <span>مخرجات الكود</span>
                {result && <span className={result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>{result.isCorrect ? '✓' : '✗'}</span>}
              </div>
              <div className="flex-1 p-4 font-mono text-xs text-left overflow-y-auto text-slate-100 whitespace-pre-wrap" dir="ltr">
                {result?.output || "بانتظار التشغيل..."}
              </div>
              {result?.feedback && (
                <div className="px-4 py-2 text-[10px] md:text-xs font-bold bg-white/5 text-slate-300 border-t border-white/5">
                   💡 {result.feedback}
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
