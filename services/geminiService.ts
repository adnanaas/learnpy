
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getTutorResponse = async (
  lessonTitle: string,
  lessonContent: string,
  userCode: string,
  userMessage: string,
  history: ChatMessage[]
) => {
  const ai = getAI();
  const systemInstruction = `
    أنت "المعلم الذكي" في أكاديمية بايثون العربية. 
    يجب أن تكون إجاباتك منظمة جداً وسهلة القراءة للطالب وتستخدم Markdown.
    
    استخدم التنسيق التالي دائماً:
    1. **العنوان**: يصف لب الموضوع.
    2. **الشرح المبسط**: نقاط واضحة ومختصرة.
    3. **توضيح الكود**: إذا كان الطالب يسأل عن كود، اشرح السطر الذي به المشكلة.
    4. **نصيحة ذهبية**: معلومة إضافية تزيد من مهارة الطالب.

    سياق الدرس: ${lessonTitle}
    محتوى الدرس: ${lessonContent}
    كود الطالب: ${userCode}
    
    تحدث بالعربية بأسلوب مشجع.
  `;

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: `رسالة الطالب: ${userMessage}` }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text || "عذراً، لم أستطع الرد حالياً.";
};

export const getCodeExecutionFeedback = async (userCode: string, lessonContext: string) => {
    const ai = getAI();
    const prompt = `
    حلل كود بايثون التالي للطالب:
    \`\`\`python
    ${userCode}
    \`\`\`
    
    أجب بتنسيق JSON حصراً:
    {
      "isCorrect": boolean,
      "output": "يجب أن تكون المخرجات هنا مطابقة تماماً لمخرجات بايثون الحقيقية. تأكد من إضافة سطر جديد (\\n) بعد كل نتيجة print. إذا كان هناك أكثر من print، كل واحدة في سطر مستقل تماماً.",
      "feedback": "شرح تعليمي للمخرجات أو الأخطاء",
      "suggestions": ["نصيحة 1"],
      "fixedCode": "الكود كاملاً بعد التصحيح"
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isCorrect: { type: Type.BOOLEAN },
                    output: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fixedCode: { type: Type.STRING }
                },
                required: ["isCorrect", "output", "feedback", "suggestions", "fixedCode"]
            }
        }
    });

    try {
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { isCorrect: false, output: "Error", feedback: "خطأ في الاتصال بالخادم الذكي.", suggestions: [], fixedCode: userCode };
    }
};
