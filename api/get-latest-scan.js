// api/get-latest-scan.js
// Returns the latest scan received for a session
// Uses Vercel Postgres for persistence across serverless invocations

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session } = req.query;
    const sessionTime = parseInt(session) || 0;
    const sessionDate = new Date(sessionTime).toISOString();

    // Find scans that came after the session started
    const result = await sql`
      SELECT scan_data, received_at 
      FROM scio_scans 
      WHERE received_at > ${sessionDate}
      ORDER BY received_at DESC
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const latestScan = result.rows[0].scan_data;
      return res.status(200).json({
        found: true,
        scan: latestScan
      });
    }

    return res.status(200).json({
      found: false,
      message: 'No new scans found'
    });

  } catch (error) {
    console.error('[get-latest-scan] Error:', error);
    return res.status(500).json({
      error: 'Failed to get scan data',
      details: error.message
    });
  }
};
