
// Always use GoogleGenAI from @google/genai.
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Using gemini-3-pro-preview for complex reasoning and coding analysis as per guidelines.
const MODEL_NAME = 'gemini-3-pro-preview';

export const getTutorResponse = async (
  lesson: string, content: string, code: string, msg: string, history: ChatMessage[]
) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      console.error("Gemini API Key is missing in environment variables.");
      return "خطأ: لم يتم العثور على مفتاح API_KEY. تأكد من إضافته في Netlify وإعادة بناء الموقع.";
    }

    // Always use a named parameter for the apiKey when initializing GoogleGenAI.
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: msg }] }
      ],
      config: {
        systemInstruction: `أنت معلم بايثون خبير وصبور. الدرس الحالي هو: ${lesson}. المحتوى التعليمي: ${content}. كود الطالب الحالي: ${code}. اشرح المفاهيم ببساطة وباللغة العربية.`,
        // Enabling thinking budget for better reasoning in tutoring.
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    // Access response.text directly as a property.
    return response.text || "لا يوجد رد من المعلم.";
  } catch (error: any) {
    console.error("Gemini Tutor Error Details:", error);
    if (error.message?.includes("403")) return "خطأ 403: مفتاح الـ API غير صالح أو منطقتك غير مدعومة حالياً.";
    if (error.message?.includes("429")) return "خطأ 429: لقد تجاوزت الحد المسموح من الطلبات، يرجى الانتظار دقيقة.";
    return `حدث خطأ فني: ${error.message}`;
  }
};

export const executeAndAnalyze = async (code: string, lesson: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "" || apiKey === "undefined") {
      throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      // Sending single prompt as a string directly.
      contents: `قم بمحاكاة تنفيذ كود بايثون التالي لدرس ${lesson}، وحلل النتيجة:\n\n${code}`,
      config: {
        systemInstruction: "تحليل كود بايثون وارجاع النتيجة بصيغة JSON حصراً. تأكد من إضافة سطر فارغ بين مخرجات الطباعة المختلفة.",
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
        },
        // Max thinking budget for gemini-3-pro-preview for deep coding logic analysis.
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    
    // Access response.text property directly.
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Gemini Analysis Error Details:", error);
    let feedback = "فشل الاتصال بالذكاء الاصطناعي.";
    
    if (error.message === "MISSING_API_KEY") {
      feedback = "مفتاح API_KEY مفقود في إعدادات المنصة.";
    } else if (error.message.includes("403")) {
      feedback = "المفتاح غير صالح أو الخدمة غير متوفرة في منطقتك.";
    } else {
      feedback = `خطأ: ${error.message}`;
    }
    
    return {
      isCorrect: false,
      output: "تعذر التحليل",
      feedback: feedback,
      fixedCode: code
    };
  }
};
