
import React, { useState } from 'react';
import { Quiz, Question } from '../types';

interface QuizModalProps {
  quiz: Quiz;
  lessonTitle: string;
  onClose: () => void;
  onFinish?: (scorePercentage: number) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quiz, lessonTitle, onClose, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = quiz.questions[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const percentage = Math.round((score / quiz.questions.length) * 100);
      setShowResult(true);
      if (onFinish) onFinish(percentage);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 relative">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">تقويم الدرس</h2>
            <p className="text-xs text-slate-300">{lessonTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {!showResult && (
              <div className="bg-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/40">
                سؤال {currentIdx + 1} من {quiz.questions.length}
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!showResult ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 leading-relaxed text-right">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  let bgColor = "bg-slate-50 border-slate-200 hover:border-emerald-300";
                  if (isAnswered) {
                    if (idx === currentQuestion.correctAnswer) bgColor = "bg-emerald-50 border-emerald-500 text-emerald-700";
                    else if (idx === selectedOption) bgColor = "bg-rose-50 border-rose-500 text-rose-700";
                    else bgColor = "bg-slate-50 border-slate-100 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={`w-full text-right p-4 rounded-2xl border-2 transition-all font-bold text-sm ${bgColor}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-[11px] md:text-xs text-blue-700 leading-relaxed animate-in slide-in-from-bottom-2">
                  <span className="font-black block mb-1">💡 معلومة إضافية:</span>
                  {currentQuestion.explanation}
                </div>
              )}

              <button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-900 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
              >
                {currentIdx < quiz.questions.length - 1 ? 'السؤال التالي ⮕' : 'عرض النتيجة وحفظ الدرجة'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="relative inline-block">
                <div className="text-6xl mb-4">
                  {score === quiz.questions.length ? '🏆' : score > quiz.questions.length / 2 ? '👏' : '📚'}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-800">نتيجتك النهائية</h3>
                <div className="text-5xl font-black text-emerald-600 my-4">
                  {Math.round((score / quiz.questions.length) * 100)}%
                </div>
                <p className="text-slate-500 font-bold">
                  تم حفظ درجتك ({score} من {quiz.questions.length}) في سجل الطالب.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setCurrentIdx(0);
                    setScore(0);
                    setShowResult(false);
                    setSelectedOption(null);
                    setIsAnswered(false);
                  }}
                  className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-50"
                >
                  إعادة التقويم
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                >
                  العودة للدرس
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
