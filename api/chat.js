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

    const systemPrompt = `You are a helpful and polite shopping assistant for the online store "Flitit".
Website: Flitit
Store Categories: Toys, Collectibles, Babies, Gaming, Electronics, Home & Kitchen, Beauty, Perfumes, Outdoor, Cricut.
Rules:
1. Greet the customer and answer questions regarding toys, electronics, gifts, or products on Flitit.
2. Reply in Roman Urdu or English depending on how the customer asked.
3. Keep the answer friendly, helpful, and concise.`;

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nCustomer: ${message}\nAssistant:` }
          ]
        }
      ]
    };

    // Direct Google Gemini API endpoint call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return res.status(500).json({ reply: 'Google API Error: ' + (data.error?.message || 'Failed to fetch response') });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Koi jawab nahi mila.';
    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ reply: 'Error: ' + error.message });
  }
}
