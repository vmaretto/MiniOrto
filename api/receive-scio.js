// api/receive-scio.js
// Endpoint to receive SCIO scan data directly from iOS app
// No more screenshots needed!

// In-memory storage for recent scans (shared with get-latest-scan.js)
const recentScans = global.recentScans || (global.recentScans = []);
const MAX_SCANS = 100; // Keep last 100 scans in memory

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    console.log('[receive-scio] Received data from iOS app:', JSON.stringify(payload, null, 2));
    
    // Validate required fields
    if (!payload) {
      return res.status(400).json({ error: 'No payload received' });
    }

    // Extract and normalize the data
    const scioData = {
      // Model info
      modelName: payload.modelName || 'Unknown',
      modelType: payload.modelType || 'unknown',
      
      // Measured values
      value: payload.value,
      units: payload.units,
      aggregatedValue: payload.aggregatedValue,
      
      // Confidence
      confidence: payload.confidence,
      lowConfidence: payload.lowConfidence,
      
      // Food info
      foodName: payload.foodName,
      
      // Metadata
      timestamp: payload.timestamp,
      scanDate: payload.scanDate || new Date().toISOString(),
      source: payload.source || 'scio-ios-app',
      
      // Device info
      deviceInfo: payload.deviceInfo || {},
      
      // Nutritional data (if provided directly)
      nutrition: payload.nutrition || {
        water: payload.water,
        carbs: payload.carbs,
        calories: payload.calories,
        sugar: payload.sugar,
        fiber: payload.fiber,
        protein: payload.protein,
        fat: payload.fat,
        brix: payload.brix
      },
      
      // Received timestamp
      receivedAt: new Date().toISOString()
    };

    // Clean up undefined values
    Object.keys(scioData.nutrition).forEach(key => {
      if (scioData.nutrition[key] === undefined) {
        delete scioData.nutrition[key];
      }
    });

    // Store in memory for polling
    recentScans.push(scioData);
    
    // Keep only last MAX_SCANS
    while (recentScans.length > MAX_SCANS) {
      recentScans.shift();
    }
    
    // TODO: Store in database (Firebase/Supabase)
    // await db.collection('scans').add(scioData);
    
    // TODO: Trigger any real-time updates
    // await notifyDashboard(scioData);

    // TODO: Forward to Mini-orto external API if configured
    // if (process.env.MINIORTO_API_URL) {
    //   await forwardToMiniOrto(scioData);
    // }

    console.log('[receive-scio] Successfully processed scan data');
    console.log('[receive-scio] Total scans in memory:', recentScans.length);
    
    return res.status(200).json({
      success: true,
      message: 'Scan data received successfully',
      data: scioData
    });

  } catch (error) {
    console.error('[receive-scio] Error processing request:', error);
    return res.status(500).json({ 
      error: 'Failed to process scan data',
      details: error.message 
    });
  }
};

// Trigger deploy Fri Jan 30 23:27:16 CET 2026
