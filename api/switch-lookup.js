// api/switch-lookup.js
// Lookup environmental data from SWITCH Food Explorer API

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { nameEn, name } = req.method === 'GET' ? req.query : req.body;
    const searchTerm = nameEn || name;

    if (!searchTerm) {
      return res.status(400).json({ error: 'No search term provided (nameEn or name)' });
    }

    // Fetch all food items from SWITCH API
    const response = await fetch(
      'https://api-gateway-switchproject.posti.world/api-refactoring/api/v1/bo/SWITCH_FOOD_EX/FOOD_ITEMS/'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SWITCH data');
    }

    const foodItems = await response.json();

    // Normalize search term
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Semantic mapping: different names that should match the same base food
    const semanticMappings = {
      // Yogurt variants → YOGURT
      'yogurt greco': 'yogurt',
      'yogurt bianco': 'yogurt',
      'yogurt naturale': 'yogurt',
      'yogurt magro': 'yogurt',
      'yogurt intero': 'yogurt',
      'greek yogurt': 'yogurt',
      'plain yogurt': 'yogurt',
      // Milk variants → COW MILK
      'latte intero': 'cow milk',
      'latte parzialmente scremato': 'cow milk',
      'latte scremato': 'cow milk',
      'whole milk': 'cow milk',
      'skim milk': 'cow milk',
      // Tomato variants → TOMATO
      'pomodoro ciliegino': 'tomato',
      'pomodoro datterino': 'tomato',
      'pomodoro cuore di bue': 'tomato',
      'cherry tomato': 'tomato',
      'pomodorino': 'tomato',
      // Cheese variants → CHEESE (generic)
      'mozzarella': 'cheese',
      'parmigiano': 'cheese',
      'grana': 'cheese',
      'pecorino': 'cheese',
      'ricotta': 'cheese',
    };
    
    // Check if we have a semantic mapping first
    let semanticSearch = semanticMappings[normalizedSearch] || null;
    
    // Remove common adjectives to get the main food item
    const removeWords = ['bianco', 'white', 'fresh', 'fresco', 'naturale', 'natural', 'intero', 'whole', 'magro', 'low-fat', 'greco', 'greek', 'scremato', 'parzialmente'];
    let cleanedSearch = normalizedSearch;
    removeWords.forEach(word => {
      cleanedSearch = cleanedSearch.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
    });
    cleanedSearch = cleanedSearch.replace(/\s+/g, ' ').trim();
    
    // Use semantic search if available, otherwise cleaned search
    const primarySearch = semanticSearch || cleanedSearch;
    
    // Extract main keyword (e.g., "Cherry tomato" → "tomato")
    const searchWords = primarySearch.split(' ');
    
    // Try to find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const item of foodItems) {
      const itemName = (item['FOOD COMMODITY ITEM'] || '').toLowerCase();
      
      // Check for exact match first (original, semantic, or cleaned)
      if (itemName === normalizedSearch || itemName === primarySearch || itemName === cleanedSearch) {
        bestMatch = item;
        bestScore = 100;
        break;
      }

      // Check semantic/primary search match
      if (primarySearch && (itemName.includes(primarySearch) || primarySearch.includes(itemName))) {
        const score = itemName === primarySearch ? 98 : 92;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
        continue;
      }

      // Check if item name contains search term (cleaned version)
      if (itemName.includes(cleanedSearch) || cleanedSearch.includes(itemName)) {
        const score = itemName === cleanedSearch ? 95 : 90;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
        continue;
      }

      // Check if item name contains search term (original)
      if (itemName.includes(normalizedSearch)) {
        const score = 85;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
        continue;
      }

      // Check if search term contains item name
      if (normalizedSearch.includes(itemName) && itemName.length > 2) {
        const score = 80;
        if (score > bestScore) {
          bestMatch = item;
          bestScore = score;
        }
        continue;
      }

      // Check each word in search term
      for (const word of searchWords) {
        if (word.length < 3) continue;
        
        // Exact word match in item name
        if (itemName === word) {
          const score = 85;
          if (score > bestScore) {
            bestMatch = item;
            bestScore = score;
          }
        }
        // Item name starts with word
        else if (itemName.startsWith(word)) {
          const score = 75;
          if (score > bestScore) {
            bestMatch = item;
            bestScore = score;
          }
        }
        // Item name contains word
        else if (itemName.includes(word)) {
          const score = 60;
          if (score > bestScore) {
            bestMatch = item;
            bestScore = score;
          }
        }
        // Word contains item name
        else if (word.includes(itemName) && itemName.length > 3) {
          const score = 50;
          if (score > bestScore) {
            bestMatch = item;
            bestScore = score;
          }
        }
      }

      // Also check Italian name in parentheses if present
      const italianMatch = itemName.match(/\(([^)]+)\)/);
      if (italianMatch) {
        const italianName = italianMatch[1].toLowerCase();
        if (italianName === normalizedSearch || normalizedSearch.includes(italianName)) {
          const score = 85;
          if (score > bestScore) {
            bestMatch = item;
            bestScore = score;
          }
        }
      }
    }

    if (!bestMatch || bestScore < 40) {
      return res.status(200).json({
        found: false,
        searchTerm,
        message: 'No matching food item found in SWITCH database'
      });
    }

    // Format response with environmental data
    const result = {
      found: true,
      matchScore: bestScore,
      searchTerm,
      matchedItem: bestMatch['FOOD COMMODITY ITEM'],
      switchId: bestMatch.id,
      
      // Environmental data
      environmental: {
        carbonFootprint: parseFloat(bestMatch.carbonFootprint) || null,
        carbonFootprintUnit: bestMatch.unitsCarbonFootprint || 'kg CO2e/kg',
        carbonFootprintBanding: bestMatch.carbonFootprintBanding,
        carbonFootprintImpact: bestMatch.carbonFootprintBandingImpactDescription,
        
        waterFootprint: parseFloat(bestMatch.waterFootprint) || null,
        waterFootprintUnit: bestMatch.unitsWaterfootprint || 'liters/kg',
        waterFootprintBanding: bestMatch.waterFootprintBanding,
        waterFootprintImpact: bestMatch.waterFootprintBandingImpactDescription,
        
        environmentalScore: bestMatch.environmentalScore,
      },
      
      // Nutritional data (per 100g)
      nutrition: {
        energy: parseFloat(bestMatch.energy) || null,
        proteins: parseFloat(bestMatch.proteins) || null,
        fat: parseFloat(bestMatch.fat) || null,
        saturatedFat: parseFloat(bestMatch.saturatedFat) || null,
        monounsaturatedFat: parseFloat(bestMatch.monounsaturatedFat) || null,
        polyunsaturatedFat: parseFloat(bestMatch.polyunsaturatedFat) || null,
        carbohydrates: parseFloat(bestMatch.carbohydrates) || null,
        soluble: parseFloat(bestMatch.soluble) || null,
        fiber: parseFloat(bestMatch.fiber) || null,
      },
      
      // Category info
      category: {
        group: bestMatch['FOOD COMMODITY GROUP'],
        subGroup: bestMatch['FOOD COMMODITY SUB-GROUP'],
      },
      
      // Recommendations
      recommendations: {
        frequency: bestMatch.frequencyOfConsumption,
        recommendation: bestMatch.recommendation,
        sustainabilityNutritional: bestMatch.Recommendation_on_Sustainability_and_Nutritional,
      }
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in switch-lookup:', error);
    return res.status(500).json({
      error: 'Failed to lookup food item',
      details: error.message
    });
  }
};
