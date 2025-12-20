
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
      systemInstruction: `أنت معلم بايثون خبير. الدرس: ${lesson}. المحتوى: ${content}. كود الطالب: ${code}.`
    }
  });
  return res.text || "لا يوجد رد.";
};

export const executeAndAnalyze = async (code: string, lesson: string) => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: `حلل هذا الكود لدرس ${lesson}:\n${code}` }] }],
    config: {
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
  return JSON.parse(res.text || '{}');
};
