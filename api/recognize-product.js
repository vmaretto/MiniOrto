// api/recognize-product.js
// Vercel Serverless Function to recognize fruits/vegetables with Claude Vision

const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Identify the fruit or vegetable in this image.

Return a JSON object with these fields:
{
  "name": string (name in Italian, e.g., "Mela Golden", "Pomodoro", "Zucchina"),
  "nameEn": string (name in English),
  "category": string (one of: "frutta", "verdura", "ortaggio", "legume", "altro"),
  "emoji": string (single emoji representing the product),
  "confidence": "alta" | "media" | "bassa",
  "description": string (brief description in Italian, max 20 words),
  "commonVarieties": array of strings (common varieties if applicable)
}

If you cannot identify a fruit or vegetable, return:
{
  "name": "Non riconosciuto",
  "nameEn": "Not recognized",
  "category": "altro",
  "emoji": "❓",
  "confidence": "bassa",
  "description": "Impossibile identificare il prodotto nell'immagine",
  "commonVarieties": []
}

Return ONLY the JSON object, no other text.`
            }
          ],
        }
      ],
    });

    // Parse Claude's response
    const responseText = response.content[0].text.trim();
    let productData;
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        productData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      productData = {
        name: 'Errore di parsing',
        nameEn: 'Parse error',
        category: 'altro',
        emoji: '❓',
        confidence: 'bassa',
        description: 'Errore nel processare la risposta',
        rawResponse: responseText
      };
    }

    // Add metadata
    productData.recognizedAt = new Date().toISOString();

    return res.status(200).json(productData);

  } catch (error) {
    console.error('Error recognizing product:', error);
    return res.status(500).json({ 
      error: 'Failed to recognize product',
      details: error.message 
    });
  }
};
