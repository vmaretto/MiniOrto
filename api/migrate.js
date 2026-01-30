// api/migrate.js
// One-time migration to create scio_scans table

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Simple auth check
  if (req.query.key !== 'setup2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Create scio_scans table
    await sql`
      CREATE TABLE IF NOT EXISTS scio_scans (
        id SERIAL PRIMARY KEY,
        scan_data JSONB NOT NULL,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_scio_scans_received 
      ON scio_scans(received_at DESC)
    `;

    return res.status(200).json({
      success: true,
      message: 'Migration completed - scio_scans table created'
    });

  } catch (error) {
    console.error('[migrate] Error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      details: error.message
    });
  }
};
