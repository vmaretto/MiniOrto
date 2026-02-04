// api/participants.js - FIXED TIMESTAMP VERSION
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM participants ORDER BY timestamp DESC'
      );
      return res.status(200).json(result.rows);
    }

    // POST
    if (req.method === 'POST') {
      const body = req.body;
      
      console.log('Received payload');
      
      // Estrai language
      const language = body.language || 'it';
      
      // Rimuovi il campo timestamp dal payload se esiste
      // perché la colonna timestamp del DB si auto-genera
      const { timestamp, ...dataWithoutTimestamp } = body;
      
      console.log('Language:', language);
      
      // Insert nel database con timestamp esplicito
      const result = await pool.query(
        'INSERT INTO participants (timestamp, language, data) VALUES (NOW(), $1, $2) RETURNING *',
        [language, dataWithoutTimestamp]
      );

      console.log('Successfully saved participant ID:', result.rows[0].id);
      
      return res.status(201).json({
        success: true,
        id: result.rows[0].id,
        timestamp: result.rows[0].timestamp
      });
    }

    // PUT - Update existing participant (e.g. add feedback data)
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Participant id is required' });
      }
      const body = req.body;
      const { timestamp, ...dataWithoutTimestamp } = body;
      
      const result = await pool.query(
        'UPDATE participants SET data = $1, language = COALESCE($2, language) WHERE id = $3 RETURNING *',
        [dataWithoutTimestamp, body.language || null, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Participant not found' });
      }
      
      return res.status(200).json({
        success: true,
        id: result.rows[0].id,
        timestamp: result.rows[0].timestamp
      });
    }

    // DELETE
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (id) {
        // Delete specific participant by ID
        const result = await pool.query('DELETE FROM participants WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Participant not found' });
        }
        
        return res.status(200).json({ 
          message: 'Participant deleted successfully',
          deletedParticipant: result.rows[0]
        });
      } else {
        // Delete all participants (existing functionality)
        await pool.query('DELETE FROM participants');
        return res.status(200).json({ 
          message: 'All participants deleted' 
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Error details:', error);
    
    return res.status(500).json({ 
      error: 'Database operation failed',
      message: error.message
    });
  }
}
