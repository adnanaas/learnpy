
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_REQUIRED");
  return new GoogleGenAI({ apiKey });
};

export const getTutorResponse = async (
  lesson: string, content: string, code: string, msg: string, history: ChatMessage[]
) => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
  return res.text || "لا يوجد رد.";
};

export const executeAndAnalyze = async (code: string, lesson: string) => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `قم بمحاكاة تنفيذ كود بايثون التالي لدرس ${lesson}، وحلل النتيجة:\n\n${code}` }] }],
    config: {
      systemInstruction: "هام جداً: عند توليد مخرجات الكود (output)، يجب وضع سطر فارغ بين نتيجة كل عملية طباعة (print) والعملية التي تليها لجعل النتائج واضحة للطالب. تأكد من أن الرد بصيغة JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          output: { 
            type: Type.STRING,
            description: "مخرجات الكود مع سطر فارغ بين كل جملة برنت وأخرى"
          },
          feedback: { type: Type.STRING },
          fixedCode: { type: Type.STRING }
        },
        required: ["isCorrect", "output", "feedback", "fixedCode"]
      }
    }
  });
  return JSON.parse(res.text || '{}');
};
