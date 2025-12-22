
import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="text-6xl mb-4 drop-shadow-lg">🐍</div>
          <h2 className="text-2xl font-black mb-1">أكاديمية بايثون الذكية</h2>
          <p className="text-slate-400 text-sm font-bold">منصة تعليمية مدعومة بالذكاء الاصطناعي</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">المصمم</p>
              <p className="text-sm font-black text-slate-800">الباحث عدنان ساعاتي</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">رقم النسخة</p>
              <p className="text-sm font-black text-slate-800">V 1.3.0</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">تاريخ الإنشاء</p>
              <p className="text-sm font-black text-slate-800">مارس 2024</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">الحالة</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-xs font-black text-emerald-600">مستقر</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 leading-relaxed italic">
              "تم تطوير هذه المنصة لتمكين الطلاب العرب من إتقان لغة بايثون باستخدام أحدث تقنيات الذكاء الاصطناعي."
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
