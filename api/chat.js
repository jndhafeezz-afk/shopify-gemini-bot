import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const STORE_RULES = `
Aap hamare online store ke friendly AI Shopping Assistant hain.

Qawaneen (Rules):
1. Aap sirf hamari website, products, orders, shipping aur delivery ke mutaliq sawalat ka jawab denge.
2. Agar koi general knowledge, coding, politics, recipes, ya doosray stores ke baray mein puche, to nihayat tameez se mana kar dein: "Main sirf hamaray store ke products aur orders ke baray mein aapki madad kar sakta hun."
3. Agar koi product ke bare mein puche, to relevant aur behtareen suggestions dein.
4. Jawab Roman Urdu ya English mein simple aur helpful tareeqay se dein.
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: STORE_RULES
    });

    const result = await model.generateContent(message);
    const replyText = result.response.text();

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server issue' });
  }
}
