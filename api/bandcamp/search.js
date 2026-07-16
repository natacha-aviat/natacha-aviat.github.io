/**
 * GET /api/bandcamp/search — proxy Bandcamp fuzzysearch
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const target = new URL('https://bandcamp.com/api/fuzzysearch/1/app_autocomplete');
    target.searchParams.set('q', req.query.q || '');
    if (req.query.param_with_locations) {
      target.searchParams.set('param_with_locations', 'true');
    }
    const upstream = await fetch(target.toString(), { headers: BANDCAMP_HEADERS });
    const text = await upstream.text();
    return res.status(upstream.status).send(text);
  } catch {
    return res.status(502).json({ error: 'Erreur proxy Bandcamp' });
  }
}
