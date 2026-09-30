import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS setup
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
    // Body ko parse karein agar string format mein ho
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const message = body?.message;
    if (!message) {
      return res.status(400).json({ reply: 'Baraye meharbani apna sawal likhein.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: 'API key configure nahi hai.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const systemPrompt = `
    Aap Flitit store ke AI Shopping Assistant hain.
    Website: Flitit
    Qawaneen:
    1. Aapne Flitit store ke products, categories (Toys, Collectibles, Babies, Gaming, Electronics, Beauty, Outdoor wagera) ke related madad karni hai.
    2. Agar customer kisi product ya gift ke baray mein puche (jaise Lego, toys, birthday gifts), to unko guide karein aur relevant products suggest karein.
    3. Roman Urdu ya English mein dostana aur helpful response dein.
    `;

    const fullPrompt = `${systemPrompt}\n\nCustomer: ${message}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const replyText = result.response.text();

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ reply: 'Server par masla hua: ' + (error.message || 'Unknown error') });
  }
}
