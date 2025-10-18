import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "edge",
};

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const { productName } = await req.json();
    if (!productName || typeof productName !== "string") {
      return jsonResponse({ error: "Invalid productName" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: "GEMINI_API_KEY not set" }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = [
      {
        role: "user",
        parts: [
          {
            text: `اكتب وصفًا موجزًا وجذابًا للمنتج التالي مخصّصًا لتطبيق إدارة مستلزمات طب الأسنان. اذكر المزايا الرئيسية، والاستخدامات، وأي تحذيرات مناسبة.\n\nاسم المنتج: ${productName}\n\nصيغة الإخراج: فقرة عربية قصيرة (3-4 جمل).`,
          },
        ],
      },
    ] as any;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    const text = (response as any).text || "";
    return jsonResponse({ text });
  } catch (err: any) {
    console.error("API error:", err);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
