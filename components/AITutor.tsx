
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getTutorResponse } from '../services/geminiService';

interface AITutorProps {
  lessonTitle: string;
  lessonContent: string;
  currentCode: string;
}

const AITutor: React.FC<AITutorProps> = ({ lessonTitle, lessonContent, currentCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `أهلاً بك! أنا معلمك الذكي لدرس "${lessonTitle}". كيف يمكنني مساعدتك في فهم هذا الكود؟` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await getTutorResponse(lessonTitle, lessonContent, currentCode, input, messages);
      setMessages(prev => [...prev, { role: 'model', text: res }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border h-full flex flex-col overflow-hidden">
      <div className="p-3 bg-slate-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider">AI TUTOR</span>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70">متصل الآن</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 bg-slate-50/30 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[85%] p-3 rounded-2xl text-[11px] md:text-xs leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 md:p-3 border-t bg-white flex gap-2 shrink-0">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="اسأل المعلم..."
          className="flex-1 px-4 py-2 text-xs md:text-sm bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
};

export default AITutor;
