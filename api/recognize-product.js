// api/recognize-product.js
// Vercel Serverless Function to recognize fruits/vegetables with Claude Vision

// Load .env.local for local development
require('dotenv').config({ path: '.env.local' });

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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ 
        error: 'API key not configured',
        name: 'Configurazione mancante',
        emoji: '⚠️',
        confidence: 'bassa'
      });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 25000, // 25 second timeout
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
              text: `Identify the fruit or vegetable in this image. This is from an Italian mini-orto (vegetable garden), so expect common Italian produce.

IMPORTANT VISUAL DISTINCTIONS:
- Peperone giallo (yellow bell pepper): blocky shape, thick walls, stem on top, smooth shiny skin, hollow inside
- Papaya: oval/pear shape, thin skin, orange flesh with black seeds when cut, tropical fruit
- Bietola da costa (Swiss chard): large green leaves with thick white/colored stalks (coste)
- Bietola da taglio: smaller leaves, thinner stalks, used for cutting
- Spinacio (spinach): smaller, darker green leaves, no thick stalks

COMMON ITALIAN GARDEN PRODUCE:
- Vegetables: pomodoro, zucchina, melanzana, peperone (rosso/giallo/verde), cetriolo, fagiolino, insalata, bietola, spinacio, cavolo, broccolo, cavolfiore
- Herbs: basilico, prezzemolo, rosmarino, salvia, menta
- Fruits: fragola, lampone, mirtillo, ribes

Return a JSON object with these fields:
{
  "name": string (specific Italian name, e.g., "Peperone giallo", "Bietola da costa", "Pomodoro cuore di bue"),
  "nameEn": string (English name),
  "category": string (one of: "frutta", "verdura", "ortaggio", "legume", "erba aromatica", "altro"),
  "emoji": string (single emoji - use exact match: 🍎apple, 🍐pear, 🍊orange, 🍋lemon, 🍌banana, 🍉watermelon, 🍇grapes, 🍓strawberry, 🫐blueberry, 🍑peach, 🥭mango, 🍍pineapple, 🥝kiwi, 🍒cherry, 🥬leafy greens/chard, 🥒cucumber, 🥕carrot, 🌽corn, 🫑pepper, 🍆eggplant, 🥦broccoli, 🧅onion, 🧄garlic, 🥔potato, 🍅tomato, 🌶️chili. For plum/prugna use 🟣, for zucchini use 🥒, if no match use 🥬),
  "confidence": "alta" | "media" | "bassa",
  "description": string (brief description in Italian, max 20 words),
  "visualCues": string (what visual features led to this identification),
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
  "visualCues": "",
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
    
    // Restituisci un oggetto compatibile anche in caso di errore
    return res.status(200).json({ 
      name: 'Errore di riconoscimento',
      nameEn: 'Recognition error',
      category: 'altro',
      emoji: '⚠️',
      confidence: 'bassa',
      description: error.message || 'Si è verificato un errore durante il riconoscimento',
      error: true,
      errorType: error.name || 'UnknownError'
    });
  }
};
