import 'dotenv/config';
// api/seed-demo-products.js - Seed demo products with realistic SCIO data
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Demo products with realistic SCIO nutritional data (per 100g)
const demoProducts = [
  {
    name: 'Broccolo',
    category: 'vegetable',
    emoji: '🥦',
    // SCIO data - realistic values for broccoli
    scio_brix: 3.2,      // Brix (sugar content indicator)
    scio_calories: 34,    // kcal
    scio_carbs: 6.6,      // g
    scio_sugar: 1.7,      // g
    scio_water: 89.3,     // %
    scio_protein: 2.8,    // g
    scio_fiber: 2.6       // g
  },
  {
    name: 'Mela Fuji',
    category: 'fruit',
    emoji: '🍎',
    // SCIO data - realistic values for Fuji apple
    scio_brix: 14.5,
    scio_calories: 52,
    scio_carbs: 13.8,
    scio_sugar: 10.4,
    scio_water: 85.6,
    scio_protein: 0.3,
    scio_fiber: 2.4
  },
  {
    name: 'Carota',
    category: 'vegetable',
    emoji: '🥕',
    // SCIO data - realistic values for carrot
    scio_brix: 8.5,
    scio_calories: 41,
    scio_carbs: 9.6,
    scio_sugar: 4.7,
    scio_water: 88.3,
    scio_protein: 0.9,
    scio_fiber: 2.8
  },
  {
    name: 'Pomodoro',
    category: 'vegetable',
    emoji: '🍅',
    // SCIO data - realistic values for tomato
    scio_brix: 5.2,
    scio_calories: 18,
    scio_carbs: 3.9,
    scio_sugar: 2.6,
    scio_water: 94.5,
    scio_protein: 0.9,
    scio_fiber: 1.2
  }
];

export default async function handler(req, res) {
  // Enable CORS
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
    // First, create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demo_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        emoji VARCHAR(10),
        image_base64 TEXT,
        scio_brix DECIMAL(5,2),
        scio_calories DECIMAL(6,2),
        scio_carbs DECIMAL(5,2),
        scio_sugar DECIMAL(5,2),
        scio_water DECIMAL(5,2),
        scio_protein DECIMAL(5,2),
        scio_fiber DECIMAL(5,2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if products already exist
    const existing = await pool.query('SELECT COUNT(*) FROM demo_products');
    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(200).json({ 
        message: 'Demo products already seeded',
        count: parseInt(existing.rows[0].count)
      });
    }

    // Insert demo products
    const inserted = [];
    for (const product of demoProducts) {
      const result = await pool.query(
        `INSERT INTO demo_products 
         (name, category, emoji, scio_brix, scio_calories, scio_carbs, scio_sugar, scio_water, scio_protein, scio_fiber, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         RETURNING *`,
        [
          product.name, product.category, product.emoji,
          product.scio_brix, product.scio_calories, product.scio_carbs,
          product.scio_sugar, product.scio_water, product.scio_protein, product.scio_fiber
        ]
      );
      inserted.push(result.rows[0]);
    }

    return res.status(201).json({ 
      message: 'Demo products seeded successfully',
      products: inserted 
    });

  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ 
      error: 'Failed to seed demo products',
      details: error.message 
    });
  }
}
