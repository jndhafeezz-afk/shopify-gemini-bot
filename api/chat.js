import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const message = body?.message;
    if (!message) return res.status(400).json({ reply: 'Please enter a message.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ reply: 'GEMINI_API_KEY is missing in Vercel settings.' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Model string update
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
    You are an intelligent shopping assistant for the online store "Flitit".
    Categories on store: Toys, Collectibles, Babies, Gaming, Electronics, Home & Kitchen, Beauty, Perfumes, Outdoor, Cricut.
    
    Instructions:
    1. Respond warmly in Roman Urdu or English depending on how the customer asked.
    2. Suggest relevant product categories and help them find what they need.
    3. Keep answers concise, helpful, and friendly.

    Customer: ${message}
    Assistant:`;

    const result = await model.generateContent(prompt);
    const replyText = result.response.text();

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ reply: 'Error: ' + error.message });
  }
}
