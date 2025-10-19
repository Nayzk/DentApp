// api/generate-description.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { productName } = (req.body || {}) as { productName?: string };
    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({ error: 'Invalid productName' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `اكتب وصفًا موجزًا وجذابًا للمنتج التالي مخصّصًا لتطبيق إدارة مستلزمات طب الأسنان. اذكر المزايا الرئيسية، والاستخدامات، وأي تحذيرات مناسبة.

اسم المنتج: ${productName}

صيغة الإخراج: فقرة عربية قصيرة (3-4 جمل).`,
          },
        ],
      },
    ] as any;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
    });

    const text = (response as any).text || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
