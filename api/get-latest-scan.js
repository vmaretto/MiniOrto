// api/get-latest-scan.js
// Returns the latest scan received for a session

// In-memory storage for recent scans (in production, use a database)
// This is shared with receive-scio.js
const recentScans = global.recentScans || (global.recentScans = []);

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

    // Find scans that came after the session started
    const newScans = recentScans.filter(scan => {
      const scanTime = new Date(scan.receivedAt).getTime();
      return scanTime > sessionTime;
    });

    if (newScans.length > 0) {
      // Return the most recent scan
      const latestScan = newScans[newScans.length - 1];
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
