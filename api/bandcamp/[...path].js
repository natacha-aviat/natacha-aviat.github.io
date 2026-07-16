/**
 * Proxy CORS Bandcamp pour Vercel.
 * Routes : POST /api/bandcamp/discover · GET /api/bandcamp/search
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

function getPath(req) {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw.join('/');
  if (typeof raw === 'string') return raw;
  return '';
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const path = getPath(req);

    if (req.method === 'POST' && path === 'discover') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
      const upstream = await fetch('https://bandcamp.com/api/discover/1/discover_web', {
        method: 'POST',
        headers: BANDCAMP_HEADERS,
        body,
      });
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    if (req.method === 'GET' && path === 'search') {
      const target = new URL('https://bandcamp.com/api/fuzzysearch/1/app_autocomplete');
      target.searchParams.set('q', req.query.q || '');
      if (req.query.param_with_locations) {
        target.searchParams.set('param_with_locations', 'true');
      }
      const upstream = await fetch(target.toString(), { headers: BANDCAMP_HEADERS });
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    return res.status(404).json({ error: 'Route inconnue' });
  } catch {
    return res.status(502).json({ error: 'Erreur proxy Bandcamp' });
  }
}
