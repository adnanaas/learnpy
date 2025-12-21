
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

export const getTutorResponse = async (
  lesson: string, content: string, code: string, msg: string, history: ChatMessage[]
) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      return "خطأ: مفتاح الـ API غير مضبوط بشكل صحيح في إعدادات الموقع.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: msg }] }
      ],
      config: {
        systemInstruction: `أنت معلم بايثون خبير وصبور. الدرس الحالي هو: ${lesson}. المحتوى التعليمي: ${content}. كود الطالب الحالي: ${code}. اشرح المفاهيم ببساطة وباللغة العربية.`
      }
    });
    return res.text || "لا يوجد رد من المعلم.";
  } catch (error: any) {
    console.error("Gemini API Detail Error:", error);
    return `عذراً، حدث خطأ أثناء الاتصال بالمعلم الذكي. (السبب: ${error.message || 'غير معروف'})`;
  }
};

export const executeAndAnalyze = async (code: string, lesson: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: `قم بمحاكاة تنفيذ كود بايثون التالي لدرس ${lesson}، وحلل النتيجة:\n\n${code}` }] }],
      config: {
        systemInstruction: "هام: قم بتحليل كود بايثون وارجاع النتيجة بصيغة JSON حصراً. تأكد من إضافة سطر فارغ بين مخرجات الطباعة المختلفة.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            output: { type: Type.STRING },
            feedback: { type: Type.STRING },
            fixedCode: { type: Type.STRING }
          },
          required: ["isCorrect", "output", "feedback", "fixedCode"]
        }
      }
    });
    
    const jsonStr = res.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Gemini Execution Detail Error:", error);
    let errorMessage = "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
    
    if (error.message === "MISSING_API_KEY") {
      errorMessage = "مفتاح API_KEY مفقود. يرجى إضافته في إعدادات البيئة (Environment Variables).";
    } else if (error.message.includes("403")) {
      errorMessage = "المفتاح المستخدم (API_KEY) غير صالح أو محظور.";
    }
    
    return {
      isCorrect: false,
      output: "خطأ في الاتصال",
      feedback: errorMessage,
      fixedCode: code
    };
  }
};
