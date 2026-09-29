import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Yahan hum bot ko rules samjha rahe hain
const STORE_RULES = `
Aap hamare online store ke friendly AI Shopping Assistant hain.

Qawaneen (Rules):
1. Aap sirf hamari website, products, orders, shipping aur delivery ke mutaliq sawalat ka jawab denge.
2. Agar koi general knowledge, coding, politics, recipes, ya doosray stores ke baray mein puche, to nihayat tameez se mana kar dein: "Main sirf hamaray store ke products aur orders ke baray mein aapki madad kar sakta hun."
3. Agar koi product ke bare mein puche, to relevant aur behtareen suggestions dein.
4. Jawab Roman Urdu ya English mein simple aur helpful tareeqay se dein.
`;

export default async function handler(req, res) {
  // CORS headers allow karte hain ke aapki Shopify site is API se baat kar sake
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Gemini AI ko sawal bhejna
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${STORE_RULES}\n\nCustomer Ka Sawal: ${message}` }]
        }
      ]
    });

    return res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server par masla hua. Koshish karein baad mein.' });
  }
}
