/**
 * POST /api/bandcamp/discover — proxy Bandcamp discover_web
 */
const BANDCAMP_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; BandcampAdvancedDiscovery/1.0)',
  'Accept': 'application/json',
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    const upstream = await fetch('https://bandcamp.com/api/discover/1/discover_web', {
      method: 'POST',
      headers: BANDCAMP_HEADERS,
      body,
    });
    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch {
    return res.status(502).json({ error: 'Erreur proxy Bandcamp' });
  }
}
