#!/usr/bin/env node
/**
 * Proxy CORS pour l'API Bandcamp.
 * Lancer : node bandcamp-proxy/server.mjs
 */
import http from 'node:http';
import https from 'node:https';

const PORT = Number(process.env.PORT) || 8787;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function proxyRequest(targetUrl, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const req = https.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; BandcampAdvancedDiscovery/1.0)',
        'Accept': 'application/json',
      },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status: res.statusCode,
        body: Buffer.concat(chunks),
      }));
    });
    req.on('error', reject);
    if (body?.length) req.write(body);
    req.end();
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, '');
    return;
  }

  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const body = await readBody(req);

    if (req.method === 'POST' && url.pathname === '/discover') {
      const result = await proxyRequest(
        'https://bandcamp.com/api/discover/1/discover_web',
        'POST',
        body,
      );
      sendJson(res, result.status, result.body.toString());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/search') {
      const q = url.searchParams.get('q');
      if (!q) {
        sendJson(res, 400, { error: 'Paramètre q manquant' });
        return;
      }
      const target = new URL('https://bandcamp.com/api/fuzzysearch/1/app_autocomplete');
      target.searchParams.set('q', q);
      if (url.searchParams.get('param_with_locations')) {
        target.searchParams.set('param_with_locations', 'true');
      }
      const result = await proxyRequest(target.toString(), 'GET');
      sendJson(res, result.status, result.body.toString());
      return;
    }

    sendJson(res, 404, { error: 'Route inconnue' });
  } catch (err) {
    console.error(err);
    sendJson(res, 502, { error: 'Erreur proxy Bandcamp' });
  }
});

server.listen(PORT, () => {
  console.log(`Proxy Bandcamp → http://localhost:${PORT}`);
});
