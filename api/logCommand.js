export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Validate payload shape and restrict batch size to prevent denial-of-service / memory abuse
    if (!body || typeof body !== 'object' || !Array.isArray(body.logs) || body.logs.length > 50) {
      return res.status(400).json({ error: 'Invalid payload format or size limit exceeded' });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
}
