import 'dotenv/config';
// api/demo-products.js - API for demo products gallery with SCIO data
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize table if not exists
async function initTable() {
  try {
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
    return true;
  } catch (error) {
    console.error('Error creating demo_products table:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Initialize table on first request
  await initTable();

  try {
    // GET - Fetch all active demo products
    if (req.method === 'GET') {
      const { all, category } = req.query;
      
      let query = 'SELECT * FROM demo_products';
      const params = [];
      let paramCount = 1;
      
      // If not admin (all=true), only show active
      if (all !== 'true') {
        query += ' WHERE active = true';
      }
      
      // Filter by category if provided
      if (category) {
        query += (all !== 'true' ? ' AND' : ' WHERE') + ` category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }
      
      query += ' ORDER BY name ASC';
      
      const result = await pool.query(query, params);
      return res.status(200).json(result.rows);
    }

    // POST - Create new demo product (admin)
    if (req.method === 'POST') {
      const { 
        name, category, emoji, image_base64,
        scio_brix, scio_calories, scio_carbs, scio_sugar, 
        scio_water, scio_protein, scio_fiber, active 
      } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }
      
      // Sanitize decimal values (comma → dot)
      const sanitize = (v) => v != null && v !== '' ? parseFloat(String(v).replace(',', '.')) || null : null;
      
      const result = await pool.query(
        `INSERT INTO demo_products 
         (name, category, emoji, image_base64, scio_brix, scio_calories, scio_carbs, scio_sugar, scio_water, scio_protein, scio_fiber, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          name, 
          category, 
          emoji || '🥬', 
          image_base64 || null,
          sanitize(scio_brix),
          sanitize(scio_calories),
          sanitize(scio_carbs),
          sanitize(scio_sugar),
          sanitize(scio_water),
          sanitize(scio_protein),
          sanitize(scio_fiber),
          active !== false
        ]
      );
      
      return res.status(201).json(result.rows[0]);
    }

    // PUT - Update demo product
    if (req.method === 'PUT') {
      const { 
        id, name, category, emoji, image_base64,
        scio_brix, scio_calories, scio_carbs, scio_sugar, 
        scio_water, scio_protein, scio_fiber, active 
      } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Product id is required' });
      }
      
      // Sanitize decimal values (comma → dot)
      const sanitize = (v) => v != null && v !== '' ? parseFloat(String(v).replace(',', '.')) || null : null;
      
      const result = await pool.query(
        `UPDATE demo_products 
         SET name = $1, category = $2, emoji = $3, image_base64 = $4,
             scio_brix = $5, scio_calories = $6, scio_carbs = $7, scio_sugar = $8,
             scio_water = $9, scio_protein = $10, scio_fiber = $11, active = $12
         WHERE id = $13
         RETURNING *`,
        [
          name, category, emoji, image_base64 || null,
          sanitize(scio_brix), sanitize(scio_calories), sanitize(scio_carbs), sanitize(scio_sugar),
          sanitize(scio_water), sanitize(scio_protein), sanitize(scio_fiber), active !== false, id
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    // DELETE - Delete demo product
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Product id is required' });
      }
      
      await pool.query('DELETE FROM demo_products WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database operation failed',
      details: error.message 
    });
  }
}
