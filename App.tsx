
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import QuizModal from './components/QuizModal';
import AuthModal from './components/AuthModal';
import { LESSONS } from './constants';
import { LessonId, Lesson, User } from './types';
import { executeAndAnalyze } from './services/geminiService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [code, setCode] = useState(lesson.examples[0]);
  const [result, setResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // التحقق من وجود جلسة سابقة
  useEffect(() => {
    const savedUser = localStorage.getItem('active_user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const users = authService.getUsers();
        const latest = users.find(u => u.email === parsed.email);
        if (latest) setUser(latest);
    }
  }, []);

  // عند تغيير الدرس، نعيد ضبط رقم المثال
  useEffect(() => {
    setExampleIndex(0);
    setCode(lesson.examples[0]);
    setResult(null);
  }, [lesson]);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    localStorage.setItem('active_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('active_user');
  };

  const handleNextExample = () => {
    const nextIdx = (exampleIndex + 1) % lesson.examples.length;
    setExampleIndex(nextIdx);
    setCode(lesson.examples[nextIdx]);
    setResult(null);
  };

  const handleRun = async () => {
    setExecuting(true);
    try {
      const res = await executeAndAnalyze(code, lesson.title);
      setResult(res);
    } catch {
      setResult({ output: "خطأ في الاتصال بالمصحح الذكي", feedback: "يرجى التحقق من اتصال الإنترنت." });
    } finally {
      setExecuting(false);
    }
  };

  const handleQuizFinish = (scorePercentage: number) => {
    if (user) {
      const updatedUser = authService.saveScore(user.email, lesson.id, scorePercentage);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('active_user', JSON.stringify(updatedUser));
      }
    }
  };

  if (!user) {
    return <AuthModal onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right flex flex-col md:flex-row" dir="rtl">
      <Sidebar 
        activeLessonId={lesson.id} 
        onLessonSelect={id => setLesson(LESSONS.find(l => l.id === id)!)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userScores={user.scores}
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

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-x-auto">
        <header className="sticky top-0 h-20 bg-white border-b px-4 md:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="flex flex-col">
                <h2 className="text-sm md:text-lg font-black text-slate-800 truncate">
                  {lesson.title}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">الطالب: {user.name}</span>
                    {user.scores[lesson.id] !== undefined && (
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">أفضل درجة: {user.scores[lesson.id]}%</span>
                    )}
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* 1. زر مثال جديد */}
            {lesson.examples.length > 1 && (
              <button 
                onClick={handleNextExample}
                className="bg-amber-100 text-amber-700 px-3 md:px-5 py-3 rounded-2xl text-[10px] md:text-xs font-black hover:bg-amber-200 transition-all flex items-center gap-2 border border-amber-200"
                title="تغيير المثال"
              >
                <span className="hidden md:inline">مثال جديد</span> <span>✨</span>
              </button>
            )}

            {/* 2. زر التقويم */}
            {lesson.quiz && (
              <button 
                onClick={() => setIsQuizOpen(true)}
                className="bg-indigo-600 text-white px-3 md:px-5 py-3 rounded-2xl text-[10px] md:text-xs font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <span className="hidden md:inline">التقويم</span> <span>📝</span>
              </button>
            )}

            {/* 3. زر التشغيل */}
            <button 
              onClick={handleRun} 
              disabled={executing}
              className="bg-emerald-600 text-white px-5 md:px-8 py-3 rounded-2xl text-xs md:text-sm font-black hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
            >
              {executing ? '...' : 'تشغيل ▶'}
            </button>

            {/* 4. زر تسجيل الخروج (الأخير دائماً) */}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl border border-slate-100" title="تسجيل الخروج">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
          <div className="w-full md:w-[400px] flex flex-col gap-6 shrink-0">
            <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col h-[350px] md:h-[400px] relative">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm md:text-base">
                  <span className="bg-emerald-100 p-1.5 rounded-lg text-lg">📖</span> الشرح التعليمي
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar text-xs md:text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap pl-2 pb-4">
                {lesson.content}
              </div>
            </section>
            
            <div className="h-[500px] md:flex-1 min-h-[400px]">
              <AITutor lessonTitle={lesson.title} lessonContent={lesson.content} currentCode={code} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 min-h-[600px]">
            <div className="flex-1 bg-[#0d1117] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl min-h-[350px]">
              <div className="bg-[#161b22] px-5 py-3 border-b border-slate-800 flex justify-between items-center">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                </div>
                <div className="flex items-center gap-3">
                   {lesson.examples.length > 1 && (
                     <span className="text-[9px] text-amber-500/80 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">EXAMPLE {exampleIndex + 1} / {lesson.examples.length}</span>
                   )}
                   <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Code Editor</span>
                </div>
              </div>
              <textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                dir="ltr"
                spellCheck={false}
                className="flex-1 bg-transparent text-emerald-400 p-6 font-mono text-sm md:text-lg focus:outline-none resize-none text-left leading-relaxed"
              />
            </div>
            
            <div className="h-64 bg-[#010409] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl shrink-0">
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 text-[10px] text-slate-500 font-mono font-bold flex justify-between items-center">
                <span>OUTPUT</span>
                {result && <span className={result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                  {result.isCorrect ? 'SUCCESS' : 'ERROR'}
                </span>}
              </div>
              <div className="flex-1 p-5 font-mono text-xs md:text-sm text-left overflow-y-auto text-slate-100 whitespace-pre-wrap" dir="ltr">
                <span className="text-slate-600 mr-2">$</span>
                {result?.output || "بانتظار تشغيل الكود..."}
              </div>
              {result && (
                <div className={`p-4 text-xs font-bold border-t border-slate-800/50 ${result.isCorrect ? 'bg-emerald-900/10 text-emerald-400' : 'bg-rose-900/10 text-rose-400'}`}>
                  {result.feedback}
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
