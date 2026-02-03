import 'dotenv/config';
// api/receive-scio.js
// Endpoint to receive SCIO scan data directly from iOS app
// Uses pg Pool for Postgres (Supabase/Neon compatible)

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
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
    
    if (!payload) {
      return res.status(400).json({ error: 'No payload received' });
    }

    // Extract and normalize the data
    const scioData = {
      modelName: payload.modelName || 'Unknown',
      modelType: payload.modelType || 'unknown',
      value: payload.value,
      units: payload.units,
      aggregatedValue: payload.aggregatedValue,
      confidence: payload.confidence,
      lowConfidence: payload.lowConfidence,
      foodName: payload.foodName,
      timestamp: payload.timestamp,
      scanDate: payload.scanDate || new Date().toISOString(),
      source: payload.source || 'scio-ios-app',
      deviceInfo: payload.deviceInfo || {},
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
      receivedAt: new Date().toISOString()
    };

    // Clean up undefined values in nutrition
    Object.keys(scioData.nutrition).forEach(key => {
      if (scioData.nutrition[key] === undefined) {
        delete scioData.nutrition[key];
      }
    });

    // Store in Postgres
    await pool.query(
      'INSERT INTO scio_scans (scan_data, received_at) VALUES ($1, NOW())',
      [JSON.stringify(scioData)]
    );
    
    // Clean up old scans (keep last 100)
    await pool.query(`
      DELETE FROM scio_scans 
      WHERE id NOT IN (
        SELECT id FROM scio_scans 
        ORDER BY received_at DESC 
        LIMIT 100
      )
    `);

    console.log('[receive-scio] Successfully stored scan in database');
    
    return res.status(200).json({
      success: true,
      message: 'Scan data received successfully',
      data: scioData
    });

  } catch (error) {
    console.error('[receive-scio] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process scan data',
      details: error.message 
    });
  }
}
