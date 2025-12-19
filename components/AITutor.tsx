
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
    { role: 'model', text: `أهلاً بك! أنا معلمك الذكي لدرس "${lessonTitle}". كيف يمكنني مساعدتك؟` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await getTutorResponse(lessonTitle, lessonContent, currentCode, input, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، حدث خطأ. حاول مجدداً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm shadow-inner">🤖</div>
        <span className="text-xs font-black">المعلم الذكي</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-[10px] text-slate-400 animate-pulse px-2">جاري التفكير...</div>}
      </div>

      <div className="p-3 border-t bg-white shrink-0">
        <div className="flex gap-2 items-center bg-slate-100 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all shadow-inner">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اسألني عن أي شيء في بايثون..."
            className="flex-1 px-3 py-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-700 disabled:opacity-30 transition-all">
            <span className="transform rotate-180">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
