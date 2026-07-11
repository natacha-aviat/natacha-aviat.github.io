/**
 * Fonction Netlify — proxy CORS pour l'API Bandcamp.
 * Déployer sur Netlify pour que /api/bandcamp fonctionne en production.
 */
const BANDCAMP_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; BandcampAdvancedDiscovery/1.0)',
  'Accept': 'application/json',
};

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const path = event.path.replace(/^\/api\/bandcamp/, '') || event.path.replace(/^.*\/bandcamp/, '');

    if (event.httpMethod === 'POST' && path === '/discover') {
      const res = await fetch('https://bandcamp.com/api/discover/1/discover_web', {
        method: 'POST',
        headers: BANDCAMP_HEADERS,
        body: event.body,
      });
      return { statusCode: res.status, headers, body: await res.text() };
    }

    if (event.httpMethod === 'GET' && path.startsWith('/search')) {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const target = new URL('https://bandcamp.com/api/fuzzysearch/1/app_autocomplete');
      target.searchParams.set('q', params.get('q') || '');
      if (params.get('param_with_locations')) {
        target.searchParams.set('param_with_locations', 'true');
      }
      const res = await fetch(target.toString(), { headers: BANDCAMP_HEADERS });
      return { statusCode: res.status, headers, body: await res.text() };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Route inconnue' }) };
  } catch {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Erreur proxy Bandcamp' }) };
  }
}
