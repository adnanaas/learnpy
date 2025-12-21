
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

/**
 * Gets a tutor response using the Gemini 3 Pro model for better reasoning in coding lessons.
 */
export const getTutorResponse = async (
  lesson: string, content: string, code: string, msg: string, history: ChatMessage[]
) => {
  // Always initialize GoogleGenAI right before use with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    // Using gemini-3-pro-preview for complex coding tasks
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
  // Access .text property directly (not as a method)
  return res.text || "لا يوجد رد.";
};

/**
 * Analyzes code execution results using the Gemini 3 Pro model for high-quality reasoning.
 */
export const executeAndAnalyze = async (code: string, lesson: string) => {
  // Always initialize GoogleGenAI right before use with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
  
  // Use .text property directly and trim for JSON parsing
  const jsonStr = res.text?.trim() || '{}';
  return JSON.parse(jsonStr);
};
